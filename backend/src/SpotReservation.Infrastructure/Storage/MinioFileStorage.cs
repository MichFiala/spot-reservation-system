using Minio;
using Minio.DataModel.Args;
using SpotReservation.Application.Abstractions;

namespace SpotReservation.Infrastructure.Storage;

internal sealed class MinioFileStorage(IMinioClient minio) : IFileStorage
{
    public const string QrBucket = "qr-codes";
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

    public async Task<Stream> DownloadAsync(string bucket, string objectKey, CancellationToken cancellationToken = default)
    {
        var memoryStream = new MemoryStream();

        await minio.GetObjectAsync(new GetObjectArgs()
            .WithBucket(bucket)
            .WithObject(objectKey)
            .WithCallbackStream(async (stream, ct) => await stream.CopyToAsync(memoryStream, ct)),
            cancellationToken);

        memoryStream.Position = 0;
        return memoryStream;
    }

    public string GetPublicUrl(string bucket, string objectKey) =>
        $"/api/files/{bucket}/{objectKey}";

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
