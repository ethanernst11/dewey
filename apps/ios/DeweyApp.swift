//
//  DeweyApp.swift
//  
//
//  Created by Ethan Ernst on 10/1/25.
//

// apps/ios/Dewey/DeweyApp.swift
import SwiftUI

@main
struct DeweyApp: App {
    var body: some Scene {
        WindowGroup { FeedView() }
    }
}

// apps/ios/Dewey/FeedView.swift
import SwiftUI

struct FeedView: View {
    @State private var books: [Book] = []
    @State private var loading = false
    let service = RecommendationService()

    var body: some View {
        NavigationStack {
            List(books) { b in
                VStack(alignment: .leading, spacing: 4) {
                    Text(b.title).font(.headline)
                    if let a = b.author { Text(a).font(.subheadline) }
                    if let d = b.description { Text(d).font(.footnote).lineLimit(3) }
                }
            }
            .navigationTitle("Dewey")
            .task {
                if !loading {
                    loading = true
                    do { books = try await service.fetchRecommendations(sessionId: UUID().uuidString, search: nil) }
                    catch { print("Fetch failed:", error) }
                    loading = false
                }
            }
        }
    }
}
