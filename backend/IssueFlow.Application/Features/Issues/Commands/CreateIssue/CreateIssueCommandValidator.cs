using FluentValidation;

namespace IssueFlow.Application.Features.Issues.Commands.CreateIssue;

public class CreateIssueCommandValidator : AbstractValidator<CreateIssueCommand>
{
    public CreateIssueCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Başlık boş olamaz.")
            .MaximumLength(200).WithMessage("Başlık 200 karakterden uzun olamaz.");

        RuleFor(x => x.HotelId)
            .NotEmpty().WithMessage("Otel seçilmesi zorunludur.");

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Açıklama 5000 karakterden uzun olamaz.");
    }
}
