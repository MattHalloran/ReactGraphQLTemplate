import { Customer } from '@local/shared';

export interface CustomerCardProps {
    customer: Customer;
    onEdit: (customer: Customer) => void;
}

