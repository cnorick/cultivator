export interface Transaction {
  account?: string;
  'account_#'?: string;
  account_id?: string;
  amount?: number;
  category?: string;
  check_number?: string;
  date?: Date;
  date_added?: Date;
  description?: string;
  full_description?: string;
  institution?: string;
  notes?: string;
  transaction_id?: string;
  sheetsRow: number; // 1-indexed
  original: any;
}
