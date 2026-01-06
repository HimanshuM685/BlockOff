export class PersistenceService {
    private static readonly STORAGE_KEY = 'gitfi_wallet_enc';

    static saveWallet(encryptedJson: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, encryptedJson);
        }
    }

    static loadWallet(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.STORAGE_KEY);
        }
        return null;
    }

    static hasWallet(): boolean {
        return !!this.loadWallet();
    }

    static clearWallet(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }
}
