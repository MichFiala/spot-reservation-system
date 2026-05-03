using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using SpotReservation.Application.Abstractions;

namespace SpotReservation.Infrastructure.Storage;

internal sealed class MinioFileStorage(IMinioClient minio, IOptions<MinioOptions> options) : IFileStorage
{
    private readonly MinioOptions _options = options.Value;

    public async Task<string> UploadAsync(string bucket, string objectKey, Stream content, string contentType, CancellationToken cancellationToken = default)
    {
        await EnsureBucketExistsAsync(bucket, cancellationToken);

        await minio.PutObjectAsync(new PutObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey)
            .WithStreamData(content)
            .WithObjectSize(content.Length)
            .WithContentType(contentType),
            cancellationToken);

        return objectKey;
    }

    public async Task DeleteAsync(string bucket, string objectKey, CancellationToken cancellationToken = default)
    {
        await minio.RemoveObjectAsync(new RemoveObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey),
            cancellationToken);
    }

    public string GetPublicUrl(string bucket, string objectKey)
    {
        var baseUrl = _options.PublicUrl.TrimEnd('/');
        return $"{baseUrl}/{bucket}/{objectKey}";
    }

    private async Task EnsureBucketExistsAsync(string bucket, CancellationToken cancellationToken)
    {
        var exists = await minio.BucketExistsAsync(new BucketExistsArgs().WithBucket(bucket), cancellationToken);
        if (!exists)
        {
            await minio.MakeBucketAsync(new MakeBucketArgs().WithBucket(bucket), cancellationToken);

            var policy = $$"""
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": ["arn:aws:s3:::{{bucket}}/*"]
                    }
                ]
            }
            """;

            await minio.SetPolicyAsync(new SetPolicyArgs()
                .WithBucket(bucket)
                .WithPolicy(policy),
                cancellationToken);
        }
    }
}
