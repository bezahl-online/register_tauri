import { Discount } from "./discount";
import { Payment } from "./payment";
import { Product } from "./product";
import { TaxType } from "./taxType";

export enum ReceiptStatus {
    Open = 'open',
    Payed = 'payed',
    Cancelled = 'cancelled',
    Parked = 'parked'
}
export enum ReceiptType {
    Start = 'start',
    Standard = 'standard',
    Storno = 'storno',
    Training = 'training',
    Zero = 'zero'
}
export interface Tax {
    rate: number;
    amount: number;
}

export interface TotalAmounts {
    price?: number; // FIXME: did I break it?
    discountAmount?: number;
    taxes?: Array<Tax> | void;
}
export interface ReceiptItem { 
    receiptCode: string;
    product: Product;
    qty?: number;
    price: number;
    taxRate: number;
    taxType: TaxType;
    discount?: Discount;
    total: number;
}
export interface Receipt {
    code: string;
    status: ReceiptStatus;
    nature: ReceiptType;
    itemlist?: Array<ReceiptItem> | void;
    total: TotalAmounts;
    payments?: Array<Payment> | void;
}
