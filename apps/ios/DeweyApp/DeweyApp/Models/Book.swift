import Foundation

enum ReadingStatus: String, Codable {
    case wantToRead = "want_to_read"
    case reading
    case read
}

struct Book: Codable, Identifiable, Hashable {
    let id: String
    var title: String
    var imageURL: URL?
    var isRead: Bool
    var status: ReadingStatus?
    var author: String?
    var description: String?
    var genre: String?
    var publishedYear: Int?
    var productURL: URL?

    init(
        id: String,
        title: String,
        imageURL: URL?,
        isRead: Bool,
        status: ReadingStatus?,
        author: String?,
        description: String?,
        genre: String?,
        publishedYear: Int?,
        productURL: URL?
    ) {
        self.id = id
        self.title = title
        self.imageURL = imageURL
        self.isRead = isRead
        self.status = status
        self.author = author
        self.description = description
        self.genre = genre
        self.publishedYear = publishedYear
        self.productURL = productURL
    }
}
