const mongoose = require('mongoose')
const path = require('path')

module.exports = {
  checkForAcceptedModification (data) {
    const dataKeys = Object.keys(data || {})
    if (
      dataKeys.includes('accepted') ||
      dataKeys.includes('isClosed') ||
      dataKeys.includes('isActive')
    ) {
      const reducedData = JSON.parse(JSON.stringify(data))
      delete reducedData.tmpAdAuthor
      const reducedDataKeys = Object.keys(reducedData)
      if (reducedDataKeys.length === 1 && reducedDataKeys[0] === 'accepted') {
        return data.accepted.isAccepted ? 'accepted' : 'unaccepted'
      } else if (reducedDataKeys.length === 1 && reducedDataKeys[0] === 'isClosed') {
        return data.isClosed ? 'closed' : 'opened'
      } else if (reducedDataKeys.length === 1 && reducedDataKeys[0] === 'isActive') {
        return data.isActive ? 'activated' : 'deactivated'
      }
    }
    return 'patched'
  },
  async findUsersForFavoriteCategorieContentNotifications (context) {
    const params = {
      query: {
        favoriteCategories: { $in: context.result.categories },
        role: { $ne: 'deleted' },
        isVerified: true,
        isActive: true,
        $select: { _id: 1 },
        $limit: 480,
        $skip: 0
      },
      paginate: false
    }
    return (await context.app.service('users').find(params)).map(user => user._id)
  },

  createModuleVisibilities (app, settings) {
    // Add settings
    if (Array.isArray(settings)) {
      app.customSettings = settings[0]
    } else {
      app.customSettings = settings
    }
    // (Re)configure i18n
    app.i18n.configure({
      locales: app.customSettings.languages,
      directory: path.join(__dirname, '../', '/locales'),
      defaultLocale: app.customSettings.defaultLanguage,
      retryInDefaultLocale: true,
      updateFiles: false,
      mustacheConfig: {
        disable: true
      }
    })
    // Create visibilities
    const tmpVisibilities = {}
    for (const key of Object.keys(app.customSettings.modules)) {
      tmpVisibilities[key] = this.isModuleActiveOrDependency(app.customSettings, key)
    }
    app.customModuleVisibilities = tmpVisibilities
  },

  isModuleActiveOrDependency (settings, moduleKey) {
    if (!settings) {
      return false
    }
    if (
      settings.modules[moduleKey].isActive ||
      (
        settings.modules[moduleKey].dependents && settings.modules[moduleKey].dependents.length > 0 &&
        settings.modules[moduleKey].dependents.map(depKey => settings.modules[depKey]).find(dependent => dependent.isActive)
      )
    ) {
      return true
    } else {
      return false
    }
  },

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

  convert: function (json, idKeys) {
    const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    return JSON.parse(JSON.stringify(json), (key, value) => {
      if (typeof value === 'string') {
        if (dateFormat.test(value)) {
          return new Date(value)
        } else if (mongoose.isValidObjectId(value) && idKeys.includes(key)) {
          return mongoose.Types.ObjectId(value)
        }
      } else if (
        key === '$in' &&
        Array.isArray(value) &&
        !value.find(id => !mongoose.isValidObjectId(id))
      ) {
        return value.map(id => mongoose.Types.ObjectId(id))
      }
      return value
    })
  },

  generateLanguageAggegationStages: async function (context, properties) {
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
        stages.push({
          $addFields: {
            ['data.' + property]: {
              $first: {
                $cond: {
                  if: {
                    $in: [context.params.connection.language, '$data.' + property + '.lang']
                  },
                  then: {
                    $filter: {
                      input: '$data.' + property,
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
                      input: '$data.' + property,
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
        stages.push({
          $addFields: {
            [property]: {
              $first: {
                $cond: {
                  if: {
                    $in: [context.params.connection.language, '$' + property + '.lang']
                  },
                  then: {
                    $filter: {
                      input: '$' + property,
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
                      input: '$' + property,
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
      }
    }

    context.result = await context.service.Model.aggregate(stages)
    if (populates) {
      if (limit) {
        if (context.result && context.result.length > 0) {
          context.result[0].data = await context.service.Model.populate(context.result[0].data, { path: populates.join(' ') })
        }
      } else {
        context.result = await context.service.Model.populate(context.result, { path: populates.join(' ') })
      }
    }

    if (limit) {
      context.result = {
        data: context.result[0] ? context.result[0].data : [],
        total: context.result[0] && context.result[0].total ? context.result[0].total : 0,
        limit,
        skip
      }
    }
  },

  generateDefaultAggegationStages: async function (context, properties) {
    let stages = []
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
    // Sort stage
    if (sort) {
      for (const prop of Object.keys(sort)) {
        if (prop.endsWith('.value')) {
          const sortPropertyBaseName = prop.split('.')[0]
          stages.push({
            $addFields: {
              [sortPropertyBaseName]: {
                $first: {
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
          })
          properties = properties.filter(e => e !== sortPropertyBaseName)
          stages.push({
            $sort: sort
          })
        } else if (prop === 'latestMessage') {
          if (context.path === 'discussions') {
            stages.push(
              {
                $lookup: {
                  from: 'discussionmessages',
                  let: {
                    discussion: '$_id'
                  },
                  pipeline: [{
                    $match: { $expr: { $eq: ['$discussion', '$$discussion'] } }
                  },
                  {
                    $project: { createdAt: 1 }
                  },
                  {
                    $sort: { createdAt: sort[prop] }
                  }, {
                    $limit: 1
                  }
                  ],
                  as: 'latestMessage'
                }
              },
              {
                $sort: {
                  'latestMessage.createdAt': sort[prop]
                }
              },
              {
                $set: {
                  latestMessage: { $first: '$latestMessage.createdAt' }
                }
              }
            )
          } else if (context.path === 'groups') {
            stages = stages.concat([
              {
                $lookup: {
                  from: 'discussions',
                  localField: '_id',
                  foreignField: 'group',
                  as: 'discussions'
                }
              },
              {
                $unwind: {
                  path: '$discussions',
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $lookup: {
                  from: 'discussionmessages',
                  let: {
                    discussion: '$discussions._id'
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: [
                            '$discussion',
                            '$$discussion'
                          ]
                        }
                      }
                    },
                    {
                      $project: {
                        createdAt: 1
                      }
                    },
                    {
                      $sort: {
                        createdAt: sort[prop]
                      }
                    },
                    {
                      $limit: 1
                    }
                  ],
                  as: 'latestMessage'
                }
              },
              {
                $sort: {
                  'latestMessage.createdAt': sort[prop]
                }
              },
              {
                $group:
                /**
                 * _id: The id of the group.
                 * fieldN: The first field name.
                 */
                {
                  _id: '$_id',
                  accepted: {
                    $first: '$accepted'
                  },
                  categories: {
                    $first: '$categories'
                  },
                  tags: {
                    $first: '$tags'
                  },
                  prominentCategories: {
                    $first: '$prominentCategories'
                  },
                  isActive: {
                    $first: '$isActive'
                  },
                  title: {
                    $first: '$title'
                  },
                  description: {
                    $first: '$description'
                  },
                  visibility: {
                    $first: '$visibility'
                  },
                  pics: {
                    $first: '$pics'
                  },
                  files: {
                    $first: '$files'
                  },
                  createdAt: {
                    $first: '$createdAt'
                  },
                  updatedAt: {
                    $first: '$updatedAt'
                  },
                  __v: {
                    $first: '$__v'
                  },
                  translationSum: {
                    $first: '$translationSum'
                  },
                  latestMessage: {
                    $first: {
                      $first: '$latestMessage.createdAt'
                    }
                  }
                }
              },
              {
                $sort:
                /**
                 * Provide any number of field/order pairs.
                 */
                {
                  latestMessage: sort[prop]
                }
              }
            ])
          }
        } else {
          stages.push({
            $sort: sort
          })
        }
      }
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
        stages.push({
          $addFields: {
            ['data.' + property]: {
              $first: {
                $filter: {
                  input: '$data.' + property,
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
        })
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
        stages.push({
          $addFields: {
            [property]: {
              $first: {
                $filter: {
                  input: '$' + property,
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
        })
      }
    }

    context.result = await context.service.Model.aggregate(stages)
    if (populates) {
      if (limit) {
        if (context.result && context.result.length > 0) {
          context.result[0].data = await context.service.Model.populate(context.result[0].data, { path: populates.join(' ') })
        }
      } else {
        context.result = await context.service.Model.populate(context.result, { path: populates.join(' ') })
      }
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
