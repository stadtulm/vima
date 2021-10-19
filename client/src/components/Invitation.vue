<template>
    <div>
      <v-sheet
        class="pa-6 pt-8"
        color="secondaryCustom"
      >
        <template
          v-if="mode === 'init'"
        >
          <v-row>
            <v-col>
              <v-btn
                outlined
                @click="mode = 'form'"
              >
                Personen hinzufügen
              </v-btn>
            </v-col>
          </v-row>
        </template>
        <v-form
          v-else-if="mode === 'form'"
          v-model="isValid"
          ref="invitationForm"
        >
          <v-row
            dense
          >
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                dense
                outlined
                v-model="firstName"
                label="Vorname"
                color="custom"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                dense
                outlined
                v-model="lastName"
                label="Nachname"
                color="custom"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row
            dense
          >
            <v-col
              cols="12"
            >
              <v-select
                dense
                outlined
                v-model="role"
                label="Rolle"
                color="custom"
                item-color="custom"
                :rules="[rules.required]"
                :items="computedRoles"
              ></v-select>
            </v-col>
            <v-col
              cols="12"
            >
              <v-select
                dense
                outlined
                v-model="organisation"
                :items="computedOrganisations"
                label="Organisation"
                item-text="name"
                item-value="_id"
                :rules="role === 'visitors' ? [] : [rules.required]"
                color="custom"
                item-color="custom"
                :disabled="(user.role !== 'admins' && user.role !== 'hosts') || disableOrganisation"
              ></v-select>
            </v-col>
            <v-col
              cols="12"
            >
              <v-text-field
                dense
                outlined
                v-model="email"
                :rules="[rules.required, rules.email]"
                label="Email-Adresse"
                color="custom"
                :error-messages="emailError"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
            >
              <v-btn
                block
                outlined
                color="custom"
                class="elevation-0"
                @click="inviteUser()"
                :disabled="!isValid"
                :loading="isSending"
              >
                Einladung per Email abschicken
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-sheet>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'Invitation',

  components: {
  },

  data: () => ({
    firstName: undefined,
    lastName: undefined,
    role: undefined,
    email: undefined,
    organisation: undefined,
    isValid: false,
    mode: 'init',
    isSending: false,
    emailError: undefined,
    disableOrganisation: false
  }),

  mounted () {
    this.organisation = this.user.organisation
  },

  methods: {
    ...mapActions('users', {
      createUser: 'create'
    }),
    async inviteUser () {
      this.emailError = undefined
      this.isSending = true
      try {
        await this.createUser({
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          role: this.role,
          organisation: this.organisation,
          createdBy: 'invitation',
          status: 'offline'
        })
        this.$refs.invitationForm.reset()
        this.isSending = false
        this.mode = 'init'
      } catch (e) {
        this.isSending = false
        if (e.errors && e.errors.email) {
          this.emailError = ['Es existiert bereits ein Zugang für diese Email-Adresse.']
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'roleItems',
      'rules'
    ]),
    ...mapGetters('auth', {
      user: 'user'
    }),
    ...mapGetters('organisations', {
      organisations: 'list'
    }),
    computedRoles () {
      if (this.user.role === 'admins' || this.user.role === 'hosts') {
        return this.roleItems
      } else {
        return this.roleItems.map(obj => {
          if (obj.value !== 'staffs' && obj.value !== 'exhibitors') {
            obj.disabled = true
          }
          return obj
        })
      }
    },
    computedOrganisations () {
      const tmpOrganisations = JSON.parse(JSON.stringify(this.organisations))
      if (this.disableOrganisation) {
        tmpOrganisations.push({ name: 'Keine Organisation', _id: null })
      }
      return tmpOrganisations
    }
  },

  watch: {
    mode () {
      if (this.mode === 'init') {
        this.sending = false
        this.email = undefined
        this.role = undefined
        this.organisation = this.user.organisation
      }
    },
    email () {
      this.emailError = undefined
    },
    role () {
      if (this.role === 'visitors') {
        this.disableOrganisation = true
        this.$nextTick(() => {
          this.organisation = null
        })
      } else {
        this.disableOrganisation = false
      }
    }
  }
}
</script>
