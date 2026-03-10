# API Documentation

This directory contains the OpenAPI specification for the DSA Tracker API.

## Files

- `openapi.yaml` - Complete API specification in OpenAPI 3.0 format
- `README.md` - This file with usage instructions

## Accessing Documentation

When the server is running, visit:
```
http://localhost:5000/api-docs
```

This will open Swagger UI where you can:
- View all API endpoints
- Test API requests directly
- View request/response schemas
- Download the OpenAPI specification

## Adding New API Endpoints

When you add a new API endpoint to the codebase, you should also document it in `openapi.yaml`. Follow these steps:

### 1. Add the Path

In the `paths` section of `openapi.yaml`, add your new endpoint:

```yaml
paths:
  # Existing paths...
  
  /api/your/new-endpoint:
    post:
      tags:
        - YourTag
      summary: Brief description
      description: Detailed description of what this endpoint does
      security:
        - bearerAuth: []
```

### 2. Add Parameters (if any)

```yaml
parameters:
  - name: parameterName
    in: path          # or query, header
    required: true
    schema:
      type: string
    example: "example-value"
```

### 3. Add Request Body (if applicable)

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required:
          - requiredField
        properties:
          requiredField:
            type: string
            example: "example-value"
          optionalField:
            type: number
            example: 123
```

### 4. Add Response Schema

```yaml
responses:
  '200':
    description: Success response
    content:
      application/json:
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Operation successful"
            data:
              type: object
              # Your response schema here
```

### 5. Add Error Responses

Use the reusable response templates:

```yaml
responses:
  '400':
    $ref: '#/components/responses/BadRequest'
  '401':
    $ref: '#/components/responses/Unauthorized'
  '403':
    $ref: '#/components/responses/Forbidden'
  '404':
    $ref: '#/components/responses/NotFound'
  '500':
    $ref: '#/components/responses/InternalServerError'
```

### 6. Add New Schemas (if needed)

If your endpoint uses new data structures, add them to the `components/schemas` section:

```yaml
components:
  schemas:
    YourNewSchema:
      type: object
      properties:
        id:
          type: integer
          example: 1
        name:
          type: string
          example: "Example Name"
```

## Documentation Best Practices

### 1. Use Descriptive Names
- Use clear, descriptive operation IDs and summaries
- Group related endpoints using tags

### 2. Provide Examples
- Include example values for all parameters and responses
- Use realistic data in examples

### 3. Document All Fields
- Explain what each field represents
- Specify data types and formats
- Mark required fields clearly

### 4. Include Error Handling
- Document all possible error responses
- Use the standard error response templates

### 5. Security
- Always specify the security requirements for protected endpoints
- Use `bearerAuth` for JWT authentication

## Template for New Endpoints

Copy and modify this template for new endpoints:

```yaml
/api/your/endpoint:
  method:
    tags:
      - YourTag
    summary: Brief one-line description
    description: 
      Detailed description of the endpoint.
      Include what it does, who can use it, and any important notes.
    security:
      - bearerAuth: []
    parameters:
      - name: pathParam
        in: path
        required: true
        schema:
          type: string
        example: "example"
      - name: queryParam
        in: query
        schema:
          type: string
        description: Optional parameter description
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/YourRequestSchema'
    responses:
      '200':
        description: Success
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/YourResponseSchema'
      '400':
        $ref: '#/components/responses/BadRequest'
      '401':
        $ref: '#/components/responses/Unauthorized'
      '500':
        $ref: '#/components/responses/InternalServerError'
```

## Validation

After updating the OpenAPI specification:

1. Restart the server
2. Visit `http://localhost:5000/api-docs`
3. Verify your new endpoint appears correctly
4. Test the endpoint using Swagger UI
5. Check that all schemas and examples are properly displayed

## Common Issues

### YAML Syntax
- Use spaces, not tabs for indentation
- Ensure proper nesting of elements
- Validate YAML syntax if you encounter errors

### Schema References
- Use `$ref` to reference reusable components
- Ensure all referenced schemas exist
- Check for circular references

### Security
- Don't forget to add security requirements for protected endpoints
- Use the standard `bearerAuth` scheme for JWT authentication

## Tools

- [Swagger Editor](https://editor.swagger.io/) - Online YAML editor with validation
- [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) - Generate client code from specs
- [Postman](https://www.postman.com/) - Import OpenAPI specs for testing

## Support

If you need help with API documentation:
1. Check existing endpoints in `openapi.yaml` for examples
2. Refer to the [OpenAPI 3.0 specification](https://swagger.io/specification/)
3. Ask in the team chat for assistance
