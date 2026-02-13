
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatConversation, ChatHistory, getCustomerChats, getCustomerChatHistory, sendAdminMessage } from '@/services/adminService';

interface ChatState {
    conversations: ChatConversation[];
    activeChatHistory: ChatHistory | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ChatState = {
    conversations: [],
    activeChatHistory: null,
    status: 'idle',
    error: null,
};

export const fetchCustomerChats = createAsyncThunk('chats/fetchConversations', async () => {
    return await getCustomerChats();
});

export const fetchChatHistory = createAsyncThunk('chats/fetchHistory', async (phoneNumber: string) => {
    return await getCustomerChatHistory(phoneNumber);
});

export const sendMessage = createAsyncThunk('chats/sendMessage', async ({ phoneNumber, message }: { phoneNumber: string; message: string }) => {
    await sendAdminMessage(phoneNumber, { message });
    return {
        id: Date.now().toString(), // Temporary ID until refresh
        role: 'assistant' as const,
        content: message,
        timestamp: new Date().toISOString(),
    };
});

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        clearActiveChat(state) {
            state.activeChatHistory = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Conversations
            .addCase(fetchCustomerChats.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCustomerChats.fulfilled, (state, action: PayloadAction<ChatConversation[]>) => {
                state.status = 'succeeded';
                state.conversations = action.payload;
            })
            .addCase(fetchCustomerChats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch chats';
            })
            // Fetch History
            .addCase(fetchChatHistory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchChatHistory.fulfilled, (state, action: PayloadAction<ChatHistory>) => {
                state.status = 'succeeded';
                state.activeChatHistory = action.payload;
            })
            // Send Message
            .addCase(sendMessage.fulfilled, (state, action) => {
                if (state.activeChatHistory) {
                    state.activeChatHistory.messages.push(action.payload);
                }
            });
    },
});

export const { clearActiveChat } = chatSlice.actions;
export default chatSlice.reducer;
