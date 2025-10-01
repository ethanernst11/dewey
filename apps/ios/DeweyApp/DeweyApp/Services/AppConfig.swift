import Foundation

struct AppConfig {
    static var baseURL: URL {
        let raw = ProcessInfo.processInfo.environment["DEWEY_API_URL"] ?? "http://localhost:8000"
        return URL(string: raw) ?? URL(string: "http://localhost:8000")!
    }

    static var projectName: String {
        ProcessInfo.processInfo.environment["DEWEY_PROJECT_NAME"] ?? "dewey"
    }

    static var apiToken: String? {
        let token = ProcessInfo.processInfo.environment["DEWEY_API_TOKEN"]
        guard let token, token.isEmpty == false else { return nil }
        return token
    }
}
