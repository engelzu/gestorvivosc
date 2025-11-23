
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
        return {
            config: {
                cidades: doc.cidades || [],
                clusters: doc.clusters || [],
                supervisores: doc.supervisores || [],
                statusList: doc.statusList || [],
                atualizadores: doc.atualizadores || [],
            },
            docId: doc.$id
        };
    } else {
        // If no config exists, create default
        try {
            const newDoc = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_CONFIG,
                ID.unique(),
                DEFAULT_CONFIG
            );
            return { config: DEFAULT_CONFIG, docId: newDoc.$id };
        } catch (error) {
             console.warn("Não foi possível criar a configuração padrão. Usando local.", error);
             // Retorna local para não travar o app
             return { config: DEFAULT_CONFIG, docId: '' };
        }
    }
};

export const saveConfig = async (docId: string, config: SystemConfig) => {
    if (!docId) {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTION_CONFIG,
            ID.unique(),
            config
        );
    }
    
    return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_CONFIG,
        docId,
        config
    );
};
