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
      ['options=staySignedIn', 'options=darkMode'],
    ],
    [
      {
        user1: {
          options: ['staySignedIn', 'darkMode'],
        },
      },
      ['user1[options]=staySignedIn', 'user1[options]=darkMode'],
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
        'parts[0]=red',
        'parts[0]=200',
        'parts[1]=green',
        'parts[1]=25',
        'parts[2]=blue',
        'parts[2]=170',
      ],
    ],
  ])('should explode %p to %p', (input, expectedOutput) => {
    expect(explodeQueryFormStyle([], '', input)).toEqual(expectedOutput)
  })
})
