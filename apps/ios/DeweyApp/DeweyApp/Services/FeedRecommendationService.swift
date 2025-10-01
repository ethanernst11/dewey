import Foundation

final class FeedRecommendationService {
    private let urlSession: URLSession

    init(urlSession: URLSession = .shared) {
        self.urlSession = urlSession
    }

    func fetchRecommendations(parameters: RecommendationRequestParameters) async throws -> [Book] {
        let endpoint = AppConfig.baseURL
            .appendingPathComponent("hackathon")
            .appendingPathComponent(AppConfig.projectName)
            .appendingPathComponent("feed")
            .appendingPathComponent(parameters.sessionId)

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = AppConfig.apiToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let body = RecommendationRequestBody(
            page: parameters.page,
            batchCount: parameters.batchCount,
            events: parameters.events,
            searchPrompt: parameters.searchPrompt
        )
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await urlSession.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let result = try decoder.decode(RecommendationResponse.self, from: data)
        return result.cards.map { card in
            let author = card.product.attributes
                .first { $0.name.caseInsensitiveCompare("Author") == .orderedSame }?
                .value
            let genre = card.product.attributes
                .first { $0.name.caseInsensitiveCompare("genre") == .orderedSame }?
                .value
            let yearString = card.product.attributes
                .first { $0.name.caseInsensitiveCompare("Year Published") == .orderedSame }?
                .value
            let year = yearString.flatMap(Int.init)

            return Book(
                id: card.id,
                title: card.product.title,
                imageURL: card.product.imageURL,
                isRead: false,
                status: .wantToRead,
                author: author,
                description: card.product.body,
                genre: genre,
                publishedYear: year,
                productURL: card.product.productURL
            )
        }
    }
}
