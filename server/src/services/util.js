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
    const populates = context.params.query.$populate
    delete context.params.query.$populate
    stages.push({
      $match: {
        ...context.params.query
      }
    })
    for (const property of properties) {
      const stage = {
        $addFields: {}
      }
      stage.$addFields[property] = {
        $filter: {
          input: '$' + property + '',
          as: property,
          cond: {
            $or: [
              {
                $eq: [
                  '$$' + property + '.type',
                  'default'
                ]
              },
              {
                $eq: [
                  '$$' + property + '.lang',
                  context.params.connection.language
                ]
              }
            ]
          }
        }
      }
      stages.push(stage)
    }
    context.result = await context.service.Model.aggregate(stages)
    if (populates) {
      // context.result = await context.service.Model.populate(context.result, { path: populates.join(' ') })
    }
  }
}
