import SwiftUI

struct FeedView: View {
    @StateObject private var viewModel = FeedViewModel()
    @State private var searchText: String = ""
    @State private var selectedBook: Book?
    @State private var showActions = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                searchBar
                content
            }
            .padding(.horizontal)
            .padding(.bottom)
            .navigationTitle("Feed")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if viewModel.isLoading {
                        ProgressView()
                    }
                }
            }
        }
        .task {
            await viewModel.loadInitial()
        }
        .refreshable {
            await viewModel.refresh()
        }
        .alert("Failed to load recommendations", isPresented: Binding<Bool>(
            get: { viewModel.errorMessage != nil },
            set: { _ in viewModel.errorMessage = nil }
        ), actions: {
            Button("Retry") {
                Task { await viewModel.loadInitial() }
            }
            Button("Dismiss", role: .cancel) { }
        }, message: {
            Text(viewModel.errorMessage ?? "Unknown error")
        })
        .confirmationDialog("Add to library", isPresented: $showActions, presenting: selectedBook) { book in
            Button("Currently Reading") {
                viewModel.addToLibrary(book, as: .reading)
            }
            Button("Want to Read") {
                viewModel.addToLibrary(book, as: .wantToRead)
            }
            Button("Mark as Read") {
                viewModel.addToLibrary(book, as: .read)
            }
            Button("Cancel", role: .cancel) { }
        }
    }

    private var searchBar: some View {
        HStack {
            TextField("Search for books", text: $searchText, onCommit: {
                Task { await viewModel.performSearch(query: searchText) }
            })
            .textFieldStyle(.roundedBorder)

            if searchText.isEmpty == false {
                Button("Clear") {
                    searchText = ""
                    Task { await viewModel.performSearch(query: "") }
                }
            }

            Button("Search") {
                Task { await viewModel.performSearch(query: searchText) }
            }
            .buttonStyle(.borderedProminent)
        }
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading && viewModel.books.isEmpty {
            VStack(spacing: 12) {
                ProgressView()
                Text("Loading recommendations...")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if viewModel.books.isEmpty {
            VStack(spacing: 12) {
                Text("No recommendations yet")
                    .font(.headline)
                Text("Try searching for a title, author, or genre.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 16) {
                    ForEach(viewModel.books) { book in
                        BookCardView(book: book)
                            .onTapGesture {
                                selectedBook = book
                                showActions = true
                            }
                            .task {
                                await viewModel.loadMoreIfNeeded(currentItem: book)
                            }
                    }

                    if viewModel.isLoadingMore {
                        HStack {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                        .padding(.vertical)
                    }
                }
                .padding(.vertical)
            }
        }
    }
}
