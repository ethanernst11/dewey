
import { Book } from '../types/book';

type UserStore = {
    readbooks: string[];
    futurebooks: string[];
    books: Book[];
}

const getLocalStore = (): UserStore => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('dewey_library');
        return stored ? JSON.parse(stored) : { readbooks: [], futurebooks: [], books: [] };
    }
    return { readbooks: [], futurebooks: [], books: [] };
};

const saveLocalStore = (store: UserStore) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('dewey_library', JSON.stringify(store));
    }
};

export function addBookToLibrary(book: Book): void {
    const store = getLocalStore();
    const exists = store.books.some(b => b.id === book.id);
    if (!exists) {
        store.books.push(book);
        store.futurebooks.push(book.id);
        saveLocalStore(store);
    }
}

export function removeBookFromLibrary(bookId: string): void {
    const store = getLocalStore();
    store.books = store.books.filter(book => book.id !== bookId);
    store.futurebooks = store.futurebooks.filter(id => id !== bookId);
    store.readbooks = store.readbooks.filter(id => id !== bookId);
    saveLocalStore(store);
}

export function markBookAsRead(bookId: string): void {
    const store = getLocalStore();
    if (!store.readbooks.includes(bookId)) {
        store.readbooks.push(bookId);
        store.futurebooks = store.futurebooks.filter(id => id !== bookId);
        
        // Update the book in the books array
        store.books = store.books.map(book => 
            book.id === bookId ? { ...book, isRead: true } : book
        );
        saveLocalStore(store);
    }
}

export function markBookAsUnread(bookId: string): void {
    const store = getLocalStore();
    if (!store.futurebooks.includes(bookId)) {
        store.futurebooks.push(bookId);
        store.readbooks = store.readbooks.filter(id => id !== bookId);
        
        // Update the book in the books array
        store.books = store.books.map(book => 
            book.id === bookId ? { ...book, isRead: false } : book
        );
        saveLocalStore(store);
    }
}

export function getLibraryBooks(): Book[] {
    const store = getLocalStore();
    return store.books;
}

export function isBookInLibrary(bookId: string): boolean {
    const store = getLocalStore();
    return store.books.some(book => book.id === bookId);
}

export function clearLibrary(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('dewey_library');
    }
}