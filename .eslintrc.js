module.exports = {
    'parser': 'babel-eslint',
    'extends': 'airbnb',
    'env': {
        'es6': true,
        'browser': true
    },
    'plugins': [
        'babel'
    ],
    'settings': {
        'import/resolver': {
            'webpack': {
                'config': './scripts/webpack.config.js'
            }
        }
    },
    'rules': {
        'babel/new-cap': 'error',
        'babel/no-invalid-this': 'error',
        'babel/object-curly-spacing': ['error', 'always'],
        'babel/quotes': 'off',
        'babel/semi': 'error',
        'babel/no-unused-expressions': 'error',

        'react/no-array-index-key': 'off',
        'react/jsx-filename-extension': [
            'error',
            {
                'extensions': [
                    '.js',
                    '.jsx'
                ]
            }
        ],

        'max-len': ['warn', { code: 120 }],
        'arrow-parens': ['error', 'always']
    }
};