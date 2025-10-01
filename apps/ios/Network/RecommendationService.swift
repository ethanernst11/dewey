//
//  RecommendationService.swift
//  
//
//  Created by Ethan Ernst on 10/1/25.
//

// apps/ios/Dewey/Network/RecommendationService.swift
import Foundation

struct Book: Decodable, Identifiable {
    let id: String
    let title: String
    let author: String?
    let coverURL: URL?
    let description: String?
}

final class RecommendationService {
    private let baseURL = URL(string: "http://localhost:8000")! // align with your README dev URL
    private let apiToken = ProcessInfo.processInfo.environment["DEWEY_API_TOKEN"] // set in Xcode scheme

    func fetchRecommendations(sessionId: String, search: String?) async throws -> [Book] {
        var url = baseURL.appendingPathComponent("/recommendations")
        if let q = search, var comps = URLComponents(url: url, resolvingAgainstBaseURL: false) {
            comps.queryItems = [.init(name: "q", value: q), .init(name: "session", value: sessionId)]
            url = comps.url!
        }
        var req = URLRequest(url: url)
        if let t = apiToken { req.addValue("Bearer \(t)", forHTTPHeaderField: "Authorization") }
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard (resp as? HTTPURLResponse)?.statusCode == 200 else { throw URLError(.badServerResponse) }
        return try JSONDecoder().decode([Book].self, from: data)
    }
}
