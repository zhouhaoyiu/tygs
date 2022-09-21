module.exports = {
  semi: true, // 不使用分号
  singleQuote: false, // 使用单引号
  trailingComma: 'all', // 不使用尾逗号 有三个可选值"<none|es5|all>"
  bracketSpacing: true, // 在对象字面量声明所使用的的花括号后（{）和前（}）输出空格 有三个可选值"<none|es5|all>"
  arrowParens: 'always', // (x) => {} 箭头函数参数只有一个时是否要有小括号 有三个可选值"<avoid|always>"
  printWidth: 100, // 一行的字符数，如果超过会进行换行，默认为80  有三个可选值"<avoid|always>"
  tabWidth: 2, // 一个tab代表几个空格数
  useTabs: false, // 是否使用tab进行缩进，默认为false，表示用空格进行缩减
  endOfLine: 'auto', // 结尾是 \n \r \n\r auto
  vueIndentScriptAndStyle: true, // vue文件中的script和style标签是否缩进 默认false
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue',
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
        trailingComma: 'all',
        bracketSpacing: true,
        jsxBracketSameLine: false,
        arrowParens: 'always',
        printWidth: 100,
        endOfLine: 'auto',
        vueIndentScriptAndStyle: true,
      }
    }
  ]
}

