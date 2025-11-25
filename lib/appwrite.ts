
import { Client, Databases, Query } from 'appwrite';
import { Order, SystemConfig, DEFAULT_CONFIG } from '../types';

// =================================================================
// 🔧 CONFIGURAÇÃO DO APPWRITE
// =================================================================
export const PROJECT_ID = (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || '692253f30000adf7ee15';
export const DATABASE_ID = '692254810021be46bb1f'; 
export const COLLECTION_ORDERS = 'orders';
export const COLLECTION_CONFIG = 'config';

const ENDPOINT = (import.meta as any).env?.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
// =================================================================

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

// =================================================================
// 🆔 GERADOR DE ID NATIVO (Sem dependência de Buffer)
// =================================================================
export const generateID = (): string => {
    // Tenta usar crypto nativo do navegador
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, '').substring(0, 20);
    }
    
    // Fallback simples e robusto
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// --- HELPER: SERIALIZAÇÃO ---

function parseConfigList(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return value ? [value] : [];
        }
    }
    return [];
}

function serializeConfigList(list: string[]): string {
    return JSON.stringify(list || []);
}

// --- HELPER: SMART RETRY (Lida com erros de esquema do banco) ---
async function executeWithSmartRetry(
    operation: (payload: any) => Promise<any>,
    initialPayload: any,
    maxRetries = 5
) {
    let currentPayload = { ...initialPayload };
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation(currentPayload);
        } catch (err: any) {
            lastError = err;
            const msg = (err.message || '');
            
            const missingMatch = msg.match(/Missing required attribute "?([^"\s]+)"?/i);
            if (missingMatch && missingMatch[1]) {
                const attr = missingMatch[1];
                
                if (attr === 'isActive') currentPayload[attr] = true;
                else if (attr.toLowerCase().includes('date') || attr.endsWith('At')) currentPayload[attr] = new Date().toISOString();
                else if (attr === 'draft') currentPayload[attr] = 0; 
                else if (attr === 'value') currentPayload[attr] = 'schema_fix';
                else if (attr === 'datatype') currentPayload[attr] = 'text';
                else if (attr === 'size') currentPayload[attr] = 1;
                else currentPayload[attr] = 'fix_value'; 
                
                continue;
            }

            const unknownMatch = msg.match(/Unknown attribute:? "?([^"\s]+)"?/i);
            if (unknownMatch && unknownMatch[1]) {
                const attr = unknownMatch[1];
                delete currentPayload[attr];
                continue;
            }

            throw err;
        }
    }
    throw lastError;
}

// =================================================================
// 📝 ORDERS SERVICES
// =================================================================

export const fetchOrders = async (): Promise<Order[]> => {
    const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ORDERS,
        [Query.orderDesc('$createdAt')]
    );
    
    return response.documents.map((doc) => ({
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
        draft: doc.draft,             
        statusDraft: doc.statusDraft, 
        dataCriacao: new Date(doc.$createdAt).getTime(),
    })) as Order[];
};

export const createOrder = async (order: Omit<Order, 'id' | 'dataCriacao'>) => {
    return await executeWithSmartRetry(async (payload) => {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ORDERS,
            generateID(), // ID Próprio
            payload
        );
    }, order);
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
    const { id: _, dataCriacao: __, ...dataToUpdate } = order as any;
    
    return await executeWithSmartRetry(async (payload) => {
        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ORDERS,
            id,
            payload
        );
    }, dataToUpdate);
};

export const deleteOrder = async (id: string) => {
    return await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ORDERS,
        id
    );
};

// =================================================================
// ⚙️ CONFIG SERVICES
// =================================================================

export const fetchConfig = async (): Promise<{ config: SystemConfig, docId: string }> => {
    const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_CONFIG,
        [Query.limit(1)]
    );

    if (response.documents.length > 0) {
        const doc = response.documents[0];
        return {
            config: {
                cidades: parseConfigList(doc.cidades),
                clusters: parseConfigList(doc.clusters),
                supervisores: parseConfigList(doc.supervisores),
                statusList: parseConfigList(doc.statusList),
                atualizadores: parseConfigList(doc.atualizadores),
                statusDraftList: parseConfigList(doc.statusDraftList),
            },
            docId: doc.$id
        };
    } else {
        const createOp = async (payload: any) => {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTION_CONFIG,
                generateID(),
                payload
            );
        };

        try {
            const serializedDefault = {
                cidades: serializeConfigList(DEFAULT_CONFIG.cidades),
                clusters: serializeConfigList(DEFAULT_CONFIG.clusters),
                supervisores: serializeConfigList(DEFAULT_CONFIG.supervisores),
                statusList: serializeConfigList(DEFAULT_CONFIG.statusList),
                atualizadores: serializeConfigList(DEFAULT_CONFIG.atualizadores),
                statusDraftList: serializeConfigList(DEFAULT_CONFIG.statusDraftList),
            };

            const newDoc = await executeWithSmartRetry(createOp, serializedDefault);
            return { config: DEFAULT_CONFIG, docId: newDoc.$id };
        } catch (error: any) {
             console.error("Falha ao criar configuração padrão:", error);
             return { config: DEFAULT_CONFIG, docId: '' };
        }
    }
};

export const saveConfig = async (docId: string, config: SystemConfig) => {
    const serializedPayload = {
        cidades: serializeConfigList(config.cidades),
        clusters: serializeConfigList(config.clusters),
        supervisores: serializeConfigList(config.supervisores),
        statusList: serializeConfigList(config.statusList),
        atualizadores: serializeConfigList(config.atualizadores),
        statusDraftList: serializeConfigList(config.statusDraftList),
    };

    const saveOp = async (payload: any) => {
        if (!docId) {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTION_CONFIG,
                generateID(),
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
