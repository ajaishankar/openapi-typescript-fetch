import explodeQueryFormStyle from '../src/explodeQueryFormStyle'

describe('explodeQueryFormStyle', () => {
  it.each([
    [null, []],
    [undefined, []],
    ['someString', ['someString']],
    [{ query: 'queryValue' }, ['query=queryValue']],
    [{ query: 9 }, ['query=9']],
    [
      {
        level1: {
          level1a: 'a',
          level1b: 'b',
        },
      },
      ['level1[level1a]=a', 'level1[level1b]=b'],
    ],
    [
      {
        level1: {
          level1a: 'a',
          level1b: 'b',
        },
        level2: {
          level2a: {
            level2sigma: 'off limits',
          },
          level2b: 'b',
        },
      },
      [
        'level1[level1a]=a',
        'level1[level1b]=b',
        'level2[level2a][level2sigma]=off%20limits',
        'level2[level2b]=b',
      ],
    ],
    [
      {
        options: ['staySignedIn', 'darkMode'],
      },
      ['options[0]=staySignedIn', 'options[1]=darkMode'],
    ],
    [
      {
        user1: {
          options: ['staySignedIn', 'darkMode'],
        },
      },
      ['user1[options][0]=staySignedIn', 'user1[options][1]=darkMode'],
    ],
    [
      ['isFirstView', 'isRedirect'],
      ['isFirstView', 'isRedirect'],
    ],
    [
      {
        list: [{ name: 'Turtle' }, { name: 'Mouse' }],
      },
      ['list[0][name]=Turtle', 'list[1][name]=Mouse'],
    ],
    [
      {
        parts: [
          ['red', 200],
          ['green', 25],
          ['blue', 170],
        ],
      },
      [
        'parts[0][0]=red',
        'parts[0][1]=200',
        'parts[1][0]=green',
        'parts[1][1]=25',
        'parts[2][0]=blue',
        'parts[2][1]=170',
      ],
    ],
  ])('should explode %p to %p', (input, expectedOutput) => {
    expect(explodeQueryFormStyle([], '', input)).toEqual(expectedOutput)
  })
})
