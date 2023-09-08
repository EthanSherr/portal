// const fs = require('fs')

// import imagetraining from '@zappar/imagetraining'
import { train } from '@zappar/imagetraining'

// const { train } = require('@zappar/imagetraining')
// const { promisify } = require('util')


// const writeFile = promisify(fs.writeFile)

const main = async () => {

  console.log('main 1', train)
  // const result = await train('../input/myfile.jpg', {
  //   onTrainProgress: (num) => {
  //     console.log('onTrainProgress', num)
  //   }
  // })
  // console.log('main 2')

  // await writeFile('../output/myfile.zpt', result)
  // console.log('main 3')

}


main()