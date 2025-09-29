
import { Book } from '../types/book';

type ReadingStatus = 'want_to_read' | 'reading' | 'read';

type UserStore = {
    readbooks: string[];
    readingbooks: string[];
    futurebooks: string[];
    books: Book[];
};

const DEFAULT_STORE: UserStore = {
    readbooks: [],
    readingbooks: [],
    futurebooks: [],
    books: [],
};

const ensureStoreShape = (raw: unknown): UserStore => {
    if (!raw || typeof raw !== 'object') {
        return { ...DEFAULT_STORE };
    }

    const parsed = raw as Partial<UserStore>;

    return {
        readbooks: Array.isArray(parsed.readbooks) ? parsed.readbooks : [],
        readingbooks: Array.isArray(parsed.readingbooks) ? parsed.readingbooks : [],
        futurebooks: Array.isArray(parsed.futurebooks) ? parsed.futurebooks : [],
        books: Array.isArray(parsed.books) ? parsed.books : [],
    };
};

const getLocalStore = (): UserStore => {
    try {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dewey_library');
            if (stored) {
                return ensureStoreShape(JSON.parse(stored));
            }
        }
    } catch (error) {
        console.error('Failed to parse local library store, resetting.', error);
    }

    return { ...DEFAULT_STORE };
};

const saveLocalStore = (store: UserStore) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('dewey_library', JSON.stringify(store));
    }
};

const updateBookStatus = (store: UserStore, bookId: string, status: ReadingStatus): UserStore => {
    const isRead = status === 'read';
    const nextStore: UserStore = {
        ...store,
        books: store.books.map(book =>
            book.id === bookId
                ? { ...book, isRead, status }
                : book
        ),
    };

    return nextStore;
};

export function addBookToLibrary(book: Book): void {
    const store = getLocalStore();
    const exists = store.books.some(b => b.id === book.id);

    if (exists) {
        return;
    }

    const nextStore: UserStore = {
        ...store,
        books: [...store.books, { ...book, isRead: false, status: 'want_to_read' }],
        futurebooks: store.futurebooks.includes(book.id)
            ? store.futurebooks
            : [...store.futurebooks, book.id],
    };

    saveLocalStore(nextStore);
}

export function removeBookFromLibrary(bookId: string): void {
    const store = getLocalStore();

    const nextStore: UserStore = {
        ...store,
        books: store.books.filter(book => book.id !== bookId),
        futurebooks: store.futurebooks.filter(id => id !== bookId),
        readingbooks: store.readingbooks.filter(id => id !== bookId),
        readbooks: store.readbooks.filter(id => id !== bookId),
    };

    saveLocalStore(nextStore);
}

export function markBookAsRead(bookId: string): void {
    const store = getLocalStore();

    if (!store.books.some(book => book.id === bookId)) {
        return;
    }

    const nextStore = updateBookStatus(store, bookId, 'read');
    nextStore.readbooks = nextStore.readbooks.includes(bookId)
        ? nextStore.readbooks
        : [...nextStore.readbooks, bookId];
    nextStore.futurebooks = nextStore.futurebooks.filter(id => id !== bookId);
    nextStore.readingbooks = nextStore.readingbooks.filter(id => id !== bookId);

    saveLocalStore(nextStore);
}

export function markBookAsCurrentlyReading(bookId: string): void {
    const store = getLocalStore();

    if (!store.books.some(book => book.id === bookId)) {
        return;
    }

    const nextStore = updateBookStatus(store, bookId, 'reading');
    nextStore.readingbooks = nextStore.readingbooks.includes(bookId)
        ? nextStore.readingbooks
        : [...nextStore.readingbooks, bookId];
    nextStore.futurebooks = nextStore.futurebooks.filter(id => id !== bookId);
    nextStore.readbooks = nextStore.readbooks.filter(id => id !== bookId);

    saveLocalStore(nextStore);
}

export function markBookAsUnread(bookId: string): void {
    const store = getLocalStore();

    if (!store.books.some(book => book.id === bookId)) {
        return;
    }

    const nextStore = updateBookStatus(store, bookId, 'want_to_read');
    nextStore.futurebooks = nextStore.futurebooks.includes(bookId)
        ? nextStore.futurebooks
        : [...nextStore.futurebooks, bookId];
    nextStore.readbooks = nextStore.readbooks.filter(id => id !== bookId);
    nextStore.readingbooks = nextStore.readingbooks.filter(id => id !== bookId);

    saveLocalStore(nextStore);
}

export function getLibraryBooks(): Book[] {
    const store = getLocalStore();

    let needsSave = false;
    const books = store.books.map(book => {
        const statusFromArrays: ReadingStatus = store.readbooks.includes(book.id)
            ? 'read'
            : store.readingbooks.includes(book.id)
                ? 'reading'
                : 'want_to_read';

        const status: ReadingStatus = book.status ?? statusFromArrays;
        const normalizedBook: Book = {
            ...book,
            status,
            isRead: status === 'read',
        };

        if (normalizedBook.status !== book.status || normalizedBook.isRead !== book.isRead) {
            needsSave = true;
        }

        return normalizedBook;
    });

    if (needsSave) {
        const nextStore: UserStore = {
            ...store,
            books,
        };
        saveLocalStore(nextStore);
        return nextStore.books;
    }

    return books;
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
