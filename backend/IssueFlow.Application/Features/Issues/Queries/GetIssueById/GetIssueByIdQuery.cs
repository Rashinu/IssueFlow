using IssueFlow.Domain.Enums;
using MediatR;

// DTO (Data Transfer Object): DB entity'sinin değil, frontend'e gönderilecek verinin şekli.
// Issue entity'sinde navigation property'ler, hash'ler vs. var — hepsini göndermek istemiyoruz.
// Bu DTO "issue detayına girince frontend ne görsün?" sorusunun cevabı.
// CreatedByUserName: kimin açtığı. AssignedUserName: kime atandığı. İkisi de string — ID değil isim yeterli.

namespace IssueFlow.Application.Features.Issues.Queries.GetIssueById;

public record GetIssueByIdQuery(Guid Id) : IRequest<IssueDetailDto>;

public record IssueDetailDto(
    Guid Id,
    string Title,
    string Description,
    IssueStatus Status,
    Priority Priority,
    Guid HotelId,
    string HotelName,
    Guid? AssignedUserId,
    string? AssignedUserName,
    DateTime CreatedAt,
    Guid? CreatedByUserId,
    string? CreatedByUserName,
    List<CommentDto> Comments);

public record CommentDto(Guid Id, string Content, string AuthorName, DateTime CreatedAt);
