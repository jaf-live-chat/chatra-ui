const idLabel = (id: string, type: 'USER' | 'VISITOR' | 'TENANT' | 'SUBSCRIPTION' | 'PAYMENT' | 'PLAN' | 'VISITOR'): string => {
    const validTypes = ['USER', 'VISITOR', 'TENANT', 'SUBSCRIPTION', 'PAYMENT', 'PLAN', 'VISITOR'];

    if (!validTypes.includes(type)) {
        throw new Error(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!id || typeof id !== 'string') {
        throw new Error('ID must be a non-empty string');
    }

    // Extract the last 7 characters from the ID
    const last7Digits = id.slice(-7);

    return `${type}_${last7Digits}`.toUpperCase();
};

export default idLabel;
