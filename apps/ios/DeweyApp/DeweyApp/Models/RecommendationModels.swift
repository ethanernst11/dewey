import Foundation

struct RecommendationRequestParameters {
    var sessionId: String
    var page: Int
    var batchCount: Int
    var events: [RecommendationEvent]
    var searchPrompt: String
}

struct RecommendationRequestBody: Encodable {
    var page: Int
    var batchCount: Int
    var events: [RecommendationEvent]
    var searchPrompt: String

    enum CodingKeys: String, CodingKey {
        case page
        case batchCount = "batch_count"
        case events
        case searchPrompt = "search_prompt"
    }
}

struct RecommendationResponse: Decodable {
    let cards: [RecommendationCard]
}

struct RecommendationCard: Decodable {
    let type: String
    let id: String
    let product: RecommendationProduct
}

struct RecommendationProduct: Decodable {
    let sku: String
    let body: String
    let title: String
    let imageURL: URL?
    let productURL: URL?
    let attributes: [RecommendationAttribute]

    enum CodingKeys: String, CodingKey {
        case sku
        case body
        case title
        case imageURL = "image_url"
        case productURL = "product_url"
        case attributes
    }
}

struct RecommendationAttribute: Decodable {
    let name: String
    let value: String
}

struct RecommendationEvent: Codable {
    var event: String
    var properties: RecommendationEventProperties
}

enum RecommendationEventProperties: Codable {
    case linger(LingerProperties)
    case abstractInterest(AbstractInterestProperties)

    init(from decoder: Decoder) throws {
        if let linger = try? LingerProperties(from: decoder) {
            self = .linger(linger)
        } else {
            let abstract = try AbstractInterestProperties(from: decoder)
            self = .abstractInterest(abstract)
        }
    }

    func encode(to encoder: Encoder) throws {
        switch self {
        case .linger(let properties):
            try properties.encode(to: encoder)
        case .abstractInterest(let properties):
            try properties.encode(to: encoder)
        }
    }
}

struct LingerProperties: Codable {
    var organizationID: String
    var visitorID: String
    var sessionID: String
    var payload: [String: LingerPayload]

    enum CodingKeys: String, CodingKey {
        case organizationID = "organization_id"
        case visitorID = "visitor_id"
        case sessionID = "session_id"
        case payload
    }
}

struct LingerPayload: Codable {
    var enterCount: Int
    var id: String
    var time: Double
    var type: String

    enum CodingKeys: String, CodingKey {
        case enterCount = "enter_count"
        case id
        case time
        case type
    }
}

struct AbstractInterestProperties: Codable {
    var organizationID: String
    var visitorID: String
    var sessionID: String
    var id: String
    var weight: Double

    enum CodingKeys: String, CodingKey {
        case organizationID = "organization_id"
        case visitorID = "visitor_id"
        case sessionID = "session_id"
        case id
        case weight
    }
}
