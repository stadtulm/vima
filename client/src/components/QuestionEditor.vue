<template>
  <v-card
    color="secondaryCustom"
    flat
    tile
    class="mb-3"
  >
    <v-card-text>
      <v-card-actions
        class="px-0 mb-3"
      >
        <v-spacer></v-spacer>
        <v-btn
          v-if="editorType !== 'add'"
          @click="$emit('remove', index)"
          class="elevation-0"
          icon
        >
          <v-icon>
            fas fa-times
          </v-icon>
        </v-btn>
      </v-card-actions>
      <v-form
        v-model="isValid"
        ref="questionForm"
      >
        <v-row
          dense
        >
          <v-col
            cols="12"
          >
            <v-text-field
              outlined
              dense
              color="custom"
              v-model="title"
              label="Titel"
              :rules="[rules.required]"
            >
            </v-text-field>
          </v-col>
          <v-col
            cols="12"
          >
            <v-textarea
              outlined
              dense
              color="custom"
              v-model="description"
              :label="$t('description')"
            >
            </v-textarea>
          </v-col>
          <v-col
            cols="12"
          >
            <v-select
              dense
              outlined
              color="custom"
              item-color="custom"
              v-model="type"
              :items="questionTypeItems"
              :item-text="(item) => $t(item.textKey)"
              :label="$t('type')"
              :rules="[rules.required]"
            >
            </v-select>
          </v-col>
          <template
            v-if="type === 'rating'"
          >
            <v-col
              cols="12"
            >
              <v-select
                outlined
                dense
                color="custom"
                item-color="custom"
                :label="$t('maximumRating')"
                v-model="maxValue"
                :items="[2, 3, 4, 5, 6, 7, 8, 9, 10]"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
          </template>
          <template
            v-else-if="type === 'check'"
          >
            <v-col
              cols="12"
            >
              <v-combobox
                color="custom"
                item-color="custom"
                dense
                multiple
                :label="$t('selectionOptions')"
                v-model="items"
                :rules="[rules.required]"
                :items="items"
              >
                <template v-slot:selection></template>
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{$t('pressEnterToAddSelectionOption')}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-combobox>
            </v-col>
          </template>
          <template
            v-else-if="type === 'radio'"
          >
            <v-col
              cols="12"
            >
              <v-combobox
                color="custom"
                item-color="custom"
                dense
                multiple
                :label="$t('selectionOptions')"
                v-model="items"
                :rules="[rules.required]"
                :items="items"
              >
                <template v-slot:selection></template>
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{$t('pressEnterToAddSelectionOption')}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-combobox>
            </v-col>
          </template>
        </v-row>
      </v-form>
      <v-card-actions
        class="px-0"
      >
        <v-btn
          outlined
          color="custom"
          @click="emitQuestion()"
          block
          :disabled="!isValid || !isDirty"
        >
          {{ editorType === 'add' ? $t('addQuestion') : $t('updateQuestion') }}
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'Template',

  props: [
    'question',
    'editorType',
    'index'
  ],

  components: {
  },

  data: () => ({
    isValid: false,
    title: undefined,
    description: undefined,
    type: undefined,
    maxValue: undefined,
    items: undefined
  }),

  mounted () {
    this.adapt()
  },

  methods: {
    adapt () {
      if (this.question) {
        this.title = this.question.title
        this.description = this.question.description
        this.type = this.question.type
        this.$nextTick(() => {
          this.maxValue = this.question.maxValue
          this.items = this.question.items
        })
      }
    },
    emitQuestion () {
      const map = {
        title: this.title,
        description: this.description,
        type: this.type,
        maxValue: this.maxValue,
        items: this.items
      }
      this.$emit('save', { index: this.index, question: map })
      if (this.editorType === 'add') {
        this.$refs.questionForm.reset()
      }
    }
  },

  computed: {
    ...mapGetters([
      'rules',
      'questionTypeItems'
    ]),
    isDirty () {
      return (
        this.title !== this.question.title ||
        this.description !== this.question.description ||
        this.type !== this.question.type ||
        this.maxValue !== this.question.maxValue ||
        this.items !== this.question.items
      )
    }
  },
  watch: {
    question: {
      deep: true,
      handler () {
        this.adapt()
      }
    },
    type () {
      this.maxValue = undefined
      this.items = undefined
    }
  }
}
</script>
