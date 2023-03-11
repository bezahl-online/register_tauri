export type PtResult = 'pending' | 'success' | 'timeout' | 'need_end_of_day' | 'abort';

export const PtResult = {
    Pending: 'pending' as PtResult,
    Success: 'success' as PtResult,
    Timeout: 'timeout' as PtResult,
    NeedEndOfDay: 'need_end_of_day' as PtResult,
    Abort: 'abort' as PtResult
};
export interface RegisterResponse { 
    error: string;
    result: PtResult;
}
export interface RegisterCompletionResponse { 
    status: number;
    message: string;
    transaction?: RegisterResponse;
}