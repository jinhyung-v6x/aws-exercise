const resources = {
  AWSTemplateFormatVersion: "2010-09-09",
  Resources: {
    OAI: {
      Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
      Properties: {
        CloudFrontOriginAccessIdentityConfig: {
          Comment: "사진 최적화 서비스용 OAI",
        },
      },
    },
    PhotoBucketOAIPolicy: {
      Type: "AWS::S3::BucketPolicy",
      Properties: {
        Bucket: { Ref: "PhotoBucket" },
        PolicyDocument: {
          Statement: [
            {
              Action: "s3:GetObject",
              Effect: "Allow",
              Resource: `arn:aws:s3:::${process.env.BUCKET_NAME}/*`,
              Principal: {
                CanonicalUser: { "Fn::GetAtt": ["OAI", "S3CanonicalUserId"] },
              },
            },
          ],
        },
      },
    },
    PhotoBucket: {
      Type: "AWS::S3::Bucket",
      Properties: {
        BucketName: process.env.BUCKET_NAME,
      },
    },
  },
};

export default resources;
