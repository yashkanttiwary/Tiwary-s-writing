import { NextResponse } from 'next/server';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yashkanttiwary.com';
  
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "Tiwary's Writing API",
      description: "Read-only API for accessing the public literary archive of Yash Kant Tiwary.",
      version: "1.0.0",
      contact: {
        name: "Yash Kant Tiwary"
      }
    },
    servers: [
      {
        url: `${siteUrl}/api/v1`
      }
    ],
    paths: {
      "/writings": {
        get: {
          summary: "List writings",
          description: "Returns a paginated list of public writings.",
          parameters: [
            {
              name: "year",
              in: "query",
              schema: { type: "string" },
              description: "Filter by publication year"
            },
            {
              name: "type",
              in: "query",
              schema: { type: "string" },
              description: "Filter by writing type (e.g., poetry, prose)"
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 100 },
              description: "Maximum number of writings to return"
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number"
            }
          ],
          responses: {
            "200": {
              description: "A paginated list of writings",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/WritingSummary"
                        }
                      },
                      meta: {
                        type: "object",
                        properties: {
                          total: { type: "integer" },
                          page: { type: "integer" },
                          limit: { type: "integer" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/writings/{id}": {
        get: {
          summary: "Get a specific writing",
          description: "Returns the complete data and content for a specific writing. Use .md extension for Markdown format.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "The stable ID of the writing (append .md for Markdown representation)"
            }
          ],
          responses: {
            "200": {
              description: "Writing details",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Writing"
                  }
                },
                "text/markdown": {
                  schema: {
                    type: "string"
                  }
                }
              }
            },
            "404": {
              description: "Writing not found"
            }
          }
        }
      }
    },
    components: {
      schemas: {
        WritingSummary: {
          type: "object",
          properties: {
            id: { type: "string" },
            canonicalUrl: { type: "string", format: "uri" },
            title: { type: "string" },
            publishedAt: { type: "string", format: "date-time" },
            type: { type: "string" },
            language: { type: "string" },
            excerpt: { type: "string" }
          }
        },
        Writing: {
          allOf: [
            { $ref: "#/components/schemas/WritingSummary" },
            {
              type: "object",
              properties: {
                body: { type: "string" },
                bodyFormat: { type: "string", example: "markdown" },
                themes: { type: "array", items: { type: "string" } },
                tags: { type: "array", items: { type: "string" } },
                collections: { type: "array", items: { type: "string" } }
              }
            }
          ]
        }
      }
    }
  };

  return NextResponse.json(openApiSpec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    }
  });
}
