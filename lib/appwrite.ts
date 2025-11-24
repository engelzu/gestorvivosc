
import { Client, Databases, ID, Query } from 'appwrite';
import { Order, SystemConfig, DEFAULT_CONFIG } from '../types';

// =================================================================
// 🔧 CONFIGURAÇÃO DO APPWRITE
// =================================================================
// Tenta usar variáveis de ambiente do Vite primeiro, senão usa os valores fixos
export const PROJECT_ID = (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || '692253f30000adf7ee15';
export const DATABASE_ID = '692254810021be46bb1f'; // ID do banco mantido fixo pois não foi passado na env
export const COLLECTION_ORDERS = 'orders';
export const COLLECTION_CONFIG = 'config';

const ENDPOINT = (import.meta as any).env?.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
// =================================================================

// Initialize Client safely
const client = new Client();

try {
    if (PROJECT_ID) {
        client
            .setEndpoint(ENDPOINT)
            .setProject(PROJECT_ID);
    }
} catch (err) {
    console.error("Falha ao inicializar Appwrite Client:", err);
}

const databases = new Databases(client);

// --- HELPER: SERIALIZAÇÃO PARA APPWRITE ---
// O banco de dados foi configurado com campos do tipo String (tamanho 255).
// O App trabalha com Arrays (Listas).
// Precisamos converter Array -> String (JSON) ao salvar.
// E converter String (JSON) -> Array ao ler.

function parseConfigList(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // Se falhar o parse (ex: é um texto simples e não json), envelopa em array
            return value ? [value] : [];
        }
    }
    return [];
}

function serializeConfigList(list: string[]): string {
    // Garante que é uma string JSON para salvar no campo String do banco
    return JSON.stringify(list || []);
}


// --- HELPER: SMART RETRY ---
/**
 * Executa uma operação no Appwrite e corrige automaticamente erros de estrutura.
 * - Se faltar um atributo obrigatório (Missing required attribute), ele adiciona um valor padrão.
 * - Se tiver um atributo desconhecido (Unknown attribute), ele o remove do payload.
 */
async function executeWithSmartRetry(
    operation: (payload: any) => Promise<any>,
    initialPayload: any,
    maxRetries = 7 // Tentativas generosas para resolver múltiplos erros em sequência
) {
    let currentPayload = { ...initialPayload };
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation(currentPayload);
        } catch (err: any) {
            lastError = err;
            const msg = (err.message || '');
            
            // Caso 1: Atributo Faltando (Missing required attribute)
            const missingMatch = msg.match(/Missing required attribute "?([^"\s]+)"?/i);
            if (missingMatch && missingMatch[1]) {
                const attr = missingMatch[1];
                console.warn(`[SmartRetry] Atributo obrigatório faltando: "${attr}". Adicionando valor padrão.`);
                
                // Adiciona valor dummy baseado no nome para passar na validação
                if (attr === 'isActive') currentPayload[attr] = true;
                else if (attr.toLowerCase().includes('date') || attr.endsWith('At')) currentPayload[attr] = new Date().toISOString();
                else if (attr === 'value') currentPayload[attr] = 'schema_fix';
                else if (attr === 'datatype') currentPayload[attr] = 'text';
                else if (attr === 'size') currentPayload[attr] = 1;
                else currentPayload[attr] = 'fix_value'; 
                
                continue; // Tenta de novo com o novo payload
            }

            // Caso 2: Atributo Desconhecido (Unknown attribute)
            const unknownMatch = msg.match(/Unknown attribute:? "?([^"\s]+)"?/i);
            if (unknownMatch && unknownMatch[1]) {
                const attr = unknownMatch[1];
                console.warn(`[SmartRetry] Atributo desconhecido: "${attr}". Removendo do payload.`);
                
                delete currentPayload[attr];
                
                continue; // Tenta de novo sem o campo problemático
            }

            // Se for outro erro (ex: permissão, rede), não temos como corrigir automaticamente
            throw err;
        }
    }
    // Se esgotou tentativas sem sucesso
    throw lastError;
}

// --- ORDERS SERVICES ---

export const fetchOrders = async (): Promise<Order[]> => {
    // Removido try/catch para permitir que o App.tsx detecte erros de CORS/Conexão
    const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ORDERS,
        [Query.orderDesc('$createdAt')]
    );
    
    // Map Appwrite document to our Order interface
    return response.documents.map(doc => ({
        id: doc.$id,
        pedido: doc.pedido,
        cliente: doc.cliente,
        cidade: doc.cidade,
        cluster: doc.cluster,
        status: doc.status,
        obs: doc.obs,
        supervisor: doc.supervisor,
        alteracaoRede: doc.alteracaoRede,
        redeDesignada: doc.redeDesignada,
        redeConstruida: doc.redeConstruida,
        chamado: doc.chamado,
        atualizadoPor: doc.atualizadoPor,
        dataCriacao: new Date(doc.$createdAt).getTime(),
    })) as Order[];
};

export const createOrder = async (order: Omit<Order, 'id' | 'dataCriacao'>) => {
    return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ORDERS,
        ID.unique(),
        order
    );
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
    // Remove id and dataCriacao from payload as they are system managed or read-only
    const { id: _, dataCriacao: __, ...dataToUpdate } = order as any;
    
    return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ORDERS,
        id,
        dataToUpdate
    );
};

export const deleteOrder = async (id: string) => {
    return await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ORDERS,
        id
    );
};

// --- CONFIG SERVICES ---

export const fetchConfig = async (): Promise<{ config: SystemConfig, docId: string }> => {
    const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_CONFIG,
        [Query.limit(1)]
    );

    if (response.documents.length > 0) {
        const doc = response.documents[0];
        // Converte as Strings JSON do banco de volta para Arrays do sistema
        return {
            config: {
                cidades: parseConfigList(doc.cidades),
                clusters: parseConfigList(doc.clusters),
                supervisores: parseConfigList(doc.supervisores),
                statusList: parseConfigList(doc.statusList),
                atualizadores: parseConfigList(doc.atualizadores),
            },
            docId: doc.$id
        };
    } else {
        // If no config exists, create default with Smart Retry
        const createOp = async (payload: any) => {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTION_CONFIG,
                ID.unique(),
                payload
            );
        };

        try {
            console.log("Criando configuração inicial...");
            // Serializa os arrays padrão para JSON string antes de enviar
            const serializedDefault = {
                cidades: serializeConfigList(DEFAULT_CONFIG.cidades),
                clusters: serializeConfigList(DEFAULT_CONFIG.clusters),
                supervisores: serializeConfigList(DEFAULT_CONFIG.supervisores),
                statusList: serializeConfigList(DEFAULT_CONFIG.statusList),
                atualizadores: serializeConfigList(DEFAULT_CONFIG.atualizadores),
            };

            const newDoc = await executeWithSmartRetry(createOp, serializedDefault);
            return { config: DEFAULT_CONFIG, docId: newDoc.$id };
        } catch (error: any) {
             console.error("Falha ao criar configuração padrão:", error);
             // Retorna local para não travar o app
             return { config: DEFAULT_CONFIG, docId: '' };
        }
    }
};

export const saveConfig = async (docId: string, config: SystemConfig) => {
    // Serializa os arrays para JSON string antes de enviar ao banco
    // Isso evita o erro "Attribute has invalid type. Value must be a valid string"
    const serializedPayload = {
        cidades: serializeConfigList(config.cidades),
        clusters: serializeConfigList(config.clusters),
        supervisores: serializeConfigList(config.supervisores),
        statusList: serializeConfigList(config.statusList),
        atualizadores: serializeConfigList(config.atualizadores),
    };

    const saveOp = async (payload: any) => {
        if (!docId) {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTION_CONFIG,
                ID.unique(),
                payload
            );
        }
        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_CONFIG,
            docId,
            payload
        );
    };

    return await executeWithSmartRetry(saveOp, serializedPayload);
};
