module.exports = {
  'extends': [
    'standard'
  ],
  "rules": {
    "operator-linebreak": ["error", "after", {
      "overrides": { "?": "ignore", ":": "ignore", "|>": "before" } }],
    "indent": ["error", 2, {
      "SwitchCase": 1,
      "VariableDeclarator": 1,
      "outerIIFEBody": 1,
      "MemberExpression": 1,
      "FunctionDeclaration": { "parameters": 1, "body": 1 },
      "FunctionExpression": { "parameters": 1, "body": 1 },
      "CallExpression": { "arguments": 1 },
      "ArrayExpression": 1,
      "ObjectExpression": 1,
      "ImportDeclaration": 1,
      "flatTernaryExpressions": true,
      "ignoreComments": false,
      "ignoredNodes": ["TemplateLiteral *"]
    }],
  }
}