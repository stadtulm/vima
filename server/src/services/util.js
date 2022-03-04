module.exports = {
  reduceTranslations: function (data, language, properties) {
    for (const property of properties) {
      if (data[property] && Array.isArray(data[property])) {
        const dataProperty = data[property].find(translation => translation.lang === language)
        if (dataProperty) {
          data[property] = [dataProperty]
        } else {
          data[property] = [data[property].find(translation => translation.type === 'default')]
        }
      }
    }
    return data
  },

  generateAggegationStages: async function (context, properties) {
    const stages = []
    // Extract query properties
    const populates = context.params.query.$populate
    delete context.params.query.$populate
    const limit = context.params.query.$limit
    delete context.params.query.$limit
    const skip = context.params.query.$skip
    delete context.params.query.$skip
    const sort = context.params.query.$sort
    delete context.params.query.$sort
    // Match stage
    stages.push({
      $match: {
        ...context.params.query
      }
    })
    // Title filter stage
    // Sort stage
    if (sort) {
      for (const prop of Object.keys(sort)) {
        if (prop.endsWith('.value')) {
          const sortPropertyBaseName = prop.split('.')[0]
          stages.push({
            $addFields: {
              [sortPropertyBaseName]: {
                $first: {
                  $cond: {
                    if: {
                      $in: [context.params.connection.language, '$' + sortPropertyBaseName + '.lang']
                    },
                    then: {
                      $filter: {
                        input: '$' + sortPropertyBaseName,
                        as: 'item',
                        cond: {
                          $eq: [
                            '$$item.lang', context.params.connection.language
                          ]
                        }
                      }
                    },
                    else: {
                      $filter: {
                        input: '$' + sortPropertyBaseName,
                        as: 'item',
                        cond: {
                          $eq: [
                            '$$item.type', 'default'
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          })
          properties = properties.filter(e => e !== sortPropertyBaseName)
        }
      }
      stages.push({
        $sort: sort
      })
    }
    if (limit) {
      // Facet stage
      stages.push(
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limit }
            ],
            total: [
              { $group: { _id: null, count: { $sum: 1 } } }
            ]
          }
        }
      )
      // Unwind
      stages.push({
        $unwind: {
          path: '$data'
        }
      })
      // Filter translations
      for (const property of properties) {
        const stage = {
          $addFields: {}
        }
        stage.$addFields['data.' + property] = {
          $filter: {
            input: '$data.' + property,
            as: 'translation',
            cond: {
              $or: [
                { $eq: ['$$translation.type', 'default'] },
                { $eq: ['$$translation.lang', context.params.connection.language] }
              ]
            }
          }
        }
        stages.push(stage)
      }
      // Group
      stages.push({
        $group: {
          _id: null,
          total: { $first: { $first: '$total.count' } },
          data: { $push: '$data' }
        }
      })
    } else {
      for (const property of properties) {
        const stage = {
          $addFields: {}
        }
        stage.$addFields[property] = {
          $filter: {
            input: '$' + property + '',
            as: 'translation',
            cond: {
              $or: [
                { $eq: ['$$translation.type', 'default'] },
                { $eq: ['$$translation.lang', context.params.connection.language] }
              ]
            }
          }
        }
        stages.push(stage)
      }
    }

    context.result = await context.service.Model.aggregate(stages)
    if (populates) {
      context.result = await context.service.Model.populate(context.result, { path: populates.join(' ') })
    }

    if (limit) {
      context.result = {
        data: context.result[0] ? context.result[0].data : [],
        total: context.result[0] && context.result[0].total ? context.result[0].total : 0,
        limit,
        skip
      }
    }
  }
}
