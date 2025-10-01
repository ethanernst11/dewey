import SwiftUI

struct LibraryView: View {
    fileprivate enum ViewState: String, CaseIterable, Identifiable {
        case wantToRead = "Want to Read"
        case reading = "Currently Reading"
        case read = "Read"

        var id: String { rawValue }
    }

    @StateObject private var libraryStore: LibraryStore
    @State private var selectedState: ViewState = .wantToRead
    @State private var bookPendingRemoval: Book?
    @State private var showRemovalConfirmation = false

    init() {
        _libraryStore = StateObject(wrappedValue: .shared)
    }

    private var currentBooks: [Book] {
        switch selectedState {
        case .wantToRead:
            return libraryStore.wantToReadBooks
        case .reading:
            return libraryStore.currentlyReadingBooks
        case .read:
            return libraryStore.readBooks
        }
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                header

                if libraryStore.books.isEmpty {
                    emptyState
                } else {
                    Picker("View", selection: $selectedState) {
                        ForEach(ViewState.allCases) { state in
                            Text(state.rawValue).tag(state)
                        }
                    }
                    .pickerStyle(.segmented)

                    Group {
                        if currentBooks.isEmpty {
                            Text("No books in this list yet.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                        } else {
                            ScrollView {
                                LazyVStack(spacing: 16) {
                                    ForEach(currentBooks) { book in
                                        LibraryBookCard(
                                            book: book,
                                            state: selectedState,
                                            onStart: { libraryStore.markAsReading(book.id) },
                                            onMarkRead: { libraryStore.markAsRead(book.id) },
                                            onMarkUnread: { libraryStore.markAsUnread(book.id) },
                                            onRemove: {
                                                bookPendingRemoval = book
                                                showRemovalConfirmation = true
                                            }
                                        )
                                    }
                                }
                                .padding(.vertical)
                            }
                        }
                    }
                }
            }
            .padding()
            .navigationTitle("Library")
        }
        .confirmationDialog(
            "Remove book?",
            isPresented: $showRemovalConfirmation,
            titleVisibility: .visible,
            presenting: bookPendingRemoval
        ) { book in
            Button("Remove", role: .destructive) {
                libraryStore.remove(book.id)
            }
            Button("Cancel", role: .cancel) { }
        } message: { book in
            Text("\(book.title) will be removed from your library.")
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("My Library")
                .font(.largeTitle)
                .bold()
            Text("Your personal collection of books (\(libraryStore.books.count))")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "books.vertical")
                .font(.largeTitle)
                .foregroundStyle(.secondary)
            Text("Your library is empty")
                .font(.headline)
            Text("Add books from the feed to start building your collection.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct LibraryBookCard: View {
    let book: Book
    let state: LibraryView.ViewState
    let onStart: () -> Void
    let onMarkRead: () -> Void
    let onMarkUnread: () -> Void
    let onRemove: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            BookCardView(book: book)
            HStack {
                switch state {
                case .wantToRead:
                    Button("Currently Reading", action: onStart)
                        .buttonStyle(.borderedProminent)
                    Button("Finished", action: onMarkRead)
                        .buttonStyle(.bordered)
                case .reading:
                    Button("Finished", action: onMarkRead)
                        .buttonStyle(.borderedProminent)
                    Button("Want to Read", action: onMarkUnread)
                        .buttonStyle(.bordered)
                case .read:
                    Button("Start", action: onStart)
                        .buttonStyle(.bordered)
                }
                Spacer()
                Button(role: .destructive, action: onRemove) {
                    Image(systemName: "trash")
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: Color.black.opacity(0.05), radius: 4)
        )
    }
}
