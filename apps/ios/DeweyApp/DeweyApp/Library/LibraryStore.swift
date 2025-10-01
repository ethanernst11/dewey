import Foundation
import Combine

private struct UserStore: Codable {
    var readbooks: [String]
    var readingbooks: [String]
    var futurebooks: [String]
    var books: [Book]

    static let empty = UserStore(readbooks: [], readingbooks: [], futurebooks: [], books: [])
}

@MainActor
final class LibraryStore: ObservableObject {
    @Published private(set) var books: [Book] = []

    static let shared = LibraryStore()

    private let storageKey = "dewey_library"
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    private init() {
        refresh()
    }

    func refresh() {
        let store = loadStore()
        books = normalizedBooks(from: store)
        if books != store.books {
            var next = store
            next.books = books
            save(store: next)
        }
    }

    func add(_ book: Book) {
        var store = loadStore()
        guard store.books.contains(where: { $0.id == book.id }) == false else {
            return
        }

        var newBook = book
        newBook.isRead = false
        newBook.status = .wantToRead
        store.books.append(newBook)
        if store.futurebooks.contains(book.id) == false {
            store.futurebooks.append(book.id)
        }
        save(store: store)
    }

    func remove(_ bookID: String) {
        var store = loadStore()
        store.books.removeAll { $0.id == bookID }
        store.futurebooks.removeAll { $0 == bookID }
        store.readingbooks.removeAll { $0 == bookID }
        store.readbooks.removeAll { $0 == bookID }
        save(store: store)
    }

    func markAsRead(_ bookID: String) {
        updateStatus(for: bookID, to: .read)
    }

    func markAsUnread(_ bookID: String) {
        updateStatus(for: bookID, to: .wantToRead)
    }

    func markAsReading(_ bookID: String) {
        updateStatus(for: bookID, to: .reading)
    }

    func isInLibrary(_ bookID: String) -> Bool {
        loadStore().books.contains(where: { $0.id == bookID })
    }

    var wantToReadBooks: [Book] {
        books.filter { $0.status ?? ($0.isRead ? .read : .wantToRead) == .wantToRead }
    }

    var currentlyReadingBooks: [Book] {
        books.filter { $0.status ?? ($0.isRead ? .read : .wantToRead) == .reading }
    }

    var readBooks: [Book] {
        books.filter { $0.status ?? ($0.isRead ? .read : .wantToRead) == .read }
    }

    private func updateStatus(for bookID: String, to status: ReadingStatus) {
        var store = loadStore()
        guard store.books.contains(where: { $0.id == bookID }) else { return }

        store.books = store.books.map { book in
            guard book.id == bookID else { return book }
            var updated = book
            updated.status = status
            updated.isRead = (status == .read)
            return updated
        }

        switch status {
        case .read:
            if store.readbooks.contains(bookID) == false {
                store.readbooks.append(bookID)
            }
            store.futurebooks.removeAll { $0 == bookID }
            store.readingbooks.removeAll { $0 == bookID }
        case .reading:
            if store.readingbooks.contains(bookID) == false {
                store.readingbooks.append(bookID)
            }
            store.futurebooks.removeAll { $0 == bookID }
            store.readbooks.removeAll { $0 == bookID }
        case .wantToRead:
            if store.futurebooks.contains(bookID) == false {
                store.futurebooks.append(bookID)
            }
            store.readbooks.removeAll { $0 == bookID }
            store.readingbooks.removeAll { $0 == bookID }
        }

        save(store: store)
    }

    private func loadStore() -> UserStore {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else {
            return UserStore.empty
        }
        do {
            return try decoder.decode(UserStore.self, from: data)
        } catch {
            return UserStore.empty
        }
    }

    private func save(store: UserStore) {
        guard let data = try? encoder.encode(store) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
        books = normalizedBooks(from: store)
    }

    private func normalizedBooks(from store: UserStore) -> [Book] {
        store.books.map { book in
            var normalized = book
            if let status = book.status {
                normalized.isRead = (status == .read)
            } else if store.readbooks.contains(book.id) {
                normalized.status = .read
                normalized.isRead = true
            } else if store.readingbooks.contains(book.id) {
                normalized.status = .reading
                normalized.isRead = false
            } else {
                normalized.status = .wantToRead
                normalized.isRead = false
            }
            return normalized
        }
    }
}
