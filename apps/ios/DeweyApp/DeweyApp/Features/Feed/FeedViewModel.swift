import Foundation
import Combine

@MainActor
final class FeedViewModel: ObservableObject {
    @Published private(set) var books: [Book] = []
    @Published private(set) var isLoading: Bool = false
    @Published private(set) var isLoadingMore: Bool = false
    @Published var errorMessage: String?
    @Published private(set) var searchQuery: String = ""

    private let service: FeedRecommendationService
    private let libraryStore: LibraryStore
    private let batchCount = 10
    private var currentPage = 1
    private var canLoadMore = true
    private let sessionId: String = UUID().uuidString

    private var cancellables: Set<AnyCancellable> = []

    init(service: FeedRecommendationService = FeedRecommendationService(), libraryStore: LibraryStore = .shared) {
        self.service = service
        self.libraryStore = libraryStore

        libraryStore.$books
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in
                self?.removeLibraryBooks()
            }
            .store(in: &cancellables)
    }

    func loadInitial() async {
        currentPage = 1
        canLoadMore = true
        await fetch(page: 1, reset: true)
    }

    func refresh() async {
        await loadInitial()
    }

    func performSearch(query: String) async {
        searchQuery = query
        await loadInitial()
    }

    func loadMoreIfNeeded(currentItem book: Book) async {
        guard canLoadMore, isLoading == false, isLoadingMore == false else { return }

        guard let index = books.firstIndex(where: { $0.id == book.id }) else { return }
        let threshold = books.index(books.endIndex, offsetBy: -3, limitedBy: books.startIndex) ?? books.startIndex
        if index >= threshold {
            await fetch(page: currentPage + 1, reset: false)
        }
    }

    func addToLibrary(_ book: Book, as desiredStatus: ReadingStatus) {
        libraryStore.add(book)
        switch desiredStatus {
        case .read:
            libraryStore.markAsRead(book.id)
        case .reading:
            libraryStore.markAsReading(book.id)
        case .wantToRead:
            libraryStore.markAsUnread(book.id)
        }
    }

    private func fetch(page: Int, reset: Bool) async {
        if reset {
            isLoading = true
        } else {
            isLoadingMore = true
        }
        defer {
            if reset {
                isLoading = false
            } else {
                isLoadingMore = false
            }
        }

        do {
            let params = RecommendationRequestParameters(
                sessionId: sessionId,
                page: page,
                batchCount: batchCount,
                events: [],
                searchPrompt: searchQuery
            )
            let results = try await service.fetchRecommendations(parameters: params)
            let filtered = filterLibraryBooks(from: results, isReset: reset)
            if reset {
                books = filtered
            } else {
                books.append(contentsOf: filtered)
            }
            currentPage = page
            canLoadMore = !filtered.isEmpty
            errorMessage = nil
        } catch {
            if reset {
                books = []
            }
            errorMessage = error.localizedDescription
            canLoadMore = false
        }
    }

    private func filterLibraryBooks(from candidates: [Book], isReset: Bool) -> [Book] {
        let libraryIDs = Set(libraryStore.books.map { $0.id })
        let existingIDs = isReset ? Set<String>() : Set(books.map { $0.id })
        return candidates.filter { candidate in
            guard libraryIDs.contains(candidate.id) == false else { return false }
            return existingIDs.contains(candidate.id) == false
        }
    }

    private func removeLibraryBooks() {
        let libraryIDs = Set(libraryStore.books.map { $0.id })
        books.removeAll { libraryIDs.contains($0.id) }
    }
}
