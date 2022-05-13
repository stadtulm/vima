<template>
  <v-card
    color="customGreyUltraLight"
  >
    <v-card-text>
      <v-row>
        <v-col
          class="word-wrap text-h5 font-weight-bold customGrey--text text-uppercase"
        >
          {{$t('faq')}}
        </v-col>
      </v-row>
      <v-row>
        <v-col
          class="title customGrey--text"
        >
          {{$t('manualTitle')}}
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-html="$t('manualBody')"
          class="customGrey--text"
        >
        </v-col>
      </v-row>
      <template
        v-for="(el, i) in computedFaq"
      >
        <v-row
          :key="i + '_title'"
        >
          <v-col
            class="title customGrey--text"
          >
            {{el.title}}
          </v-col>
        </v-row>
        <v-row
          :key="i + '_content'"
        >
          <v-col>
            <v-card>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(item, j) in el.content"
                  :key="j"
                >
                  <v-expansion-panel-header
                    class="font-weight-bold"
                  >
                    {{item.title}}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-row>
                      <v-col
                        v-html="item.text"
                      ></v-col>
                    </v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card
          ></v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  name: 'Faq',

  components: {
  },

  data: () => ({
    faq: {
      de:
        [
          {
            title: 'Profil',
            content: [
              {
                title: 'Warum muss ich ein Profil erstellen?',
                text: 'Aus administrativen Gründen müssen alle Personen, die bei ViMA aktiv werden wollen, ein Profil erstellen. Die E-Mail-Adresse ist nur den Administrator*innen zugänglich. Nutzername, Foto und Über mich sind optional und für alle registrierten Nutzer*innen sichtbar. Alter, Geschlecht und Wohnort sind zu Statistikzwecken Pflichtangaben. Sie können unter <b>Meine Einstellungen</b> festlegen für wen diese Angaben sichtbar sind.'
              },
              {
                title: 'Was kann ich machen, wenn ich ein Profil erstellt habe?',
                text: 'Um aktiv bei ViMA mitzumachen, benötigen Sie ein Profil. Hiermit können Sie Suche-Gebiete Inserate erstellen oder auf bestehende Inserate antworten. Sie können Interessengruppen beitreten und gründen. Und Sie können an Diskussionsforen teilnehmen.'
              },
              {
                title: 'Wer kann mein Profil besuchen?',
                text: 'Nur registrierte Benutzer*innen können Ihr Profil besuchen und einsehen. Unter <b>Mein ViMA öffnen -> Meine Einstellungen</b> können Sie außerdem festlegen, ob Ihre Angaben zu Alter, Geschlecht und Wohnort für andere registrierte Benutzer*innen zu sehen sind oder nur für Administrator*innen.'
              },
              {
                title: 'Was ist ein Nutzername?',
                text: 'Wenn Sie Ihr Profil erstellen, müssen Sie sich einen Nutzernamen geben. Sie bestimmen selbst, unter welchem Namen Sie für andere sichtbar sein wollen. Dies kann Ihr Name oder ein frei wählbarer Spitzname sein. Ihr Nutzername ist für Besucherinnen der Website und registrierte Nutzer*innen sichtbar. Ihre Beiträge im Diskussionsforum sowie in den öffentlichen Interessengruppen werden Ihrem Nutzernamen zugeordnet. Auch in der Mitglieder-Suche erscheinen Sie unter Ihrem Nutzername. Ihre Suche-Biete Inserate werden anonym gepostet.'
              },
              {
                title: 'Welche Informationen sind in meinem Profil für andere sichtbar?',
                text: 'Das ist ganz Ihnen überlassen. Teilen Sie so viel Sie möchten über Ihre Interessen oder Ihren Werdegang mit, aber beachten Sie dabei, dass alles, was Sie über sich schreiben, für alle registrierten Nutzer*innen zu sehen ist.'
              },
              {
                title: 'Wie ändere ich meine Profil-Daten?',
                text: 'Um Ihre Profil-Daten zu ändern, müssen Sie eingeloggt sein. Unter <b>Mein ViMA öffnen</b> können Sie unter <b>Meine Profil-Daten</b> Ihre Angaben ändern. Anschließend müssen Sie Ihre Änderungen durch <b>Daten speichern</b> – ganz unten auf der Seite – speichern.'
              },
              {
                title: 'Wie lösche ich mein Profil?',
                text: 'Sie können Ihr Profil jederzeit löschen. Wenn Sie eingeloggt sind, gehen Sie zu <b>Mein ViMA öffnen-> Meine Profil-Daten</b>, ganz unten auf der Seite klicken Sie auf <b>Profil dauerhaft löschen</b>.'
              },
              {
                title: 'Was passiert mit meinen Beiträgen, wenn ich mein Profil lösche?',
                text: 'Wenn Sie Ihr Profil löschen, werden Ihre Inserate in <b>Suche-Biete</b> ebenfalls gelöscht. Ihre Beiträge in den Interessengruppen und Diskussionsforen bleiben bestehen, jedoch anonym, d.h. ohne Verknüpfung zu Ihrem Nutzernamen. Möchten Sie, dass auch Ihre Beiträge gelöscht werden, wenn Sie Ihr Profil löschen, dann löschen Sie sie, bevor Sie Ihr Profil löschen.'
              },
              {
                title: 'Kann mein Profil von anderen gelöscht werden?',
                text: 'Ihr Profil kann nur von Ihnen selbst oder den Administrator*innen gelöscht werden.'
              },
              {
                title: 'Ich wohne nicht in Ulm, darf ich mich trotzdem registrieren?',
                text: 'Selbstverständlich! Jede/r kann bei ViMA aktiv mitmachen, der/die die Idee von ViMA mitträgt, da ViMA die Möglichkeit bietet, sich virtuell zu vernetzen und sich zu Themen von gemeinsamen Interesse auszutauschen.'
              },
              {
                title: 'Welche Informationen gehören in Über mich?',
                text: 'Das ist ganz Ihnen überlassen. Teilen Sie so viel Sie möchten über Ihre Interessen oder Ihren Werdegang mit, aber beachten Sie dabei, dass alles, was Sie über sich schreiben, für alle registrierten Nutzer*innen zu sehen ist.'
              },
              {
                title: 'Muss ich in meinem Profil ein Bild hochladen?',
                text: 'Das Hochladen eines Profilbildes ist Ihnen überlassen, aber ein Profilbild erleichtert die Wiedererkennung der Nutzer*innen. Sie können ein Bild von sich nehmen oder ein Bild, das Sie kennzeichnen soll. Bitte beachten Sie, nur Bilder zu benutzen, für die Sie auch die Bildrechte haben.'
              },
              {
                title: 'Was bedeutet Urheber Bild, wenn ich ein Bild hochlade?',
                text: 'Bei Ihrem Profil und Ihren Beiträgen dürfen Sie nur Bilder nutzen, an denen Sie die Urheberrechte haben. In diesem Feld geben Sie also bitte Ihren Namen ein, wenn Sie das Urheberrecht am Bild haben oder geben Sie die Person an, mit deren Einverständnis als Urheber*in sie das Bild einstellen. Bitte beachten Sie, das gilt für Ihr Profilbild als auch Bilder in den <b>Suche-Biete</b> Inseraten oder Interessengruppen.'
              }
            ]
          },
          {
            title: 'Mein ViMA',
            content: [
              {
                title: 'Was ist Mein ViMA öffnen?',
                text: 'Wenn Sie eingeloggt sind, haben Sie unter <b>Mein ViMA öffnen</b> Zugriff auf Ihren persönlichen ViMA- Bereich: Hier finden Sie Ihre Profil-Daten und haben Zugriff auf Ihre Inserate sowie Beiträge in Ihren Interessengruppen und den Diskussionsforen. Unter <b>Mitglieder finden</b> können Sie andere Mitglieder unter deren Nutzernamen finden und über die Chatfunktion anschreiben. Unter <b>Meine Einstellungen</b> können Sie entscheiden, in welchen Fällen Sie Benachrichtigungen zu Ihren Aktivitäten per E-Mail erhalten möchten und welche Angaben für wen sichtbar sein sollen. Unter <b>Meine Profil-Daten -> Profil bearbeiten</b> können Sie Ihre Profil Daten ändern. Sollten Sie Ihr Profil löschen wollen, klicken Sie unten links auf dieser Seite auf <b>Profil dauerhaft löschen</b>. Bitte vergessen Sie nicht, bei jeder Änderung auf <b>Daten speichern</b> zu klicken.'
              },
              {
                title: 'Wo sehe ich meine Suche-Biete Inserate?',
                text: 'Ihre Inserate finden Sie, wenn Sie eingeloggt sind, unter <b>Mein ViMA</b> öffnen mit Klick auf <b>Mein Suche/Biete</b>. In dieser Ansicht können Sie Ihr Inserat auch bearbeiten oder löschen. Unter <b>Interessent*innen</b> können Sie sehen, wer auf Ihr Inserat geantwortet hat. Hier sehen Sie auch alle Inserate, auf die Sie geantwortet haben. Sie erkennen dies, wenn in der Spalte <b>Relation Interessent*in</b> steht. Unter Ihrem eigenen Inserat steht unter <b>Relation Initiator*in</b>.'
              },
              {
                title: 'Wann bekomme ich E-Mails von ViMA?',
                text: 'Wenn Sie eingeloggt sind, legen Sie unter <b>Mein ViMA öffnen -> Meine Einstellungen</b> fest, ob und wann und ob Sie Benachrichtigungen per E-Mail erhalten wollen, z.B., wenn Sie neue Antworten auf Ihr <b>Suche-Biete</b> Inserat erhalten haben, oder eine neue Nachricht im Chat für Sie vorliegt. Wenn Sie das nicht möchten, können Sie einstellen, dass Sie nie benachrichtigt werden. In diesem Fall bitten wir Sie, sich regelmäßig einzuloggen, um zu prüfen ob Sie Nachrichten erhalten haben, damit diese nicht unbeantwortet bleiben.'
              },
              {
                title: 'Soll ich mich jedes Mal ausloggen und dann erneut einloggen?',
                text: 'Das liegt bei Ihnen. Wenn das Gerät, über das Sie sich einloggen, auch von anderen benutzt wird, empfehlen wir, sich jedes Mal auszuloggen, so dass niemand anderes ungewollt Zugriff auf Ihr Profil hat. Ansonsten ist es natürlich sehr praktisch, wenn Sie eingeloggt bleiben, weil Sie dann gleich auf mein <b>Mein ViMA öffnen</b> zugreifen können.'
              },
              {
                title: 'Wie sehe ich, dass ich neue Nachrichten habe?',
                text: 'Wenn es Neuigkeiten für Sie gibt, erscheint ein Ausrufezeichen neben <b>Mein ViMA öffnen</b>. Wenn Sie nun das Klappmenü (Drop Down Menu, von englisch to drop down‚ "herunterfallen") aufklappen, sehen Sie ein weiteres Ausrufezeichen neben dem Bereich, in dem es etwas Neues für Sie gibt. Zudem können Sie Benachrichtigungen auch per E-Mail erhalten, wenn Sie das möchten. Dazu müssen Sie, wenn Sie eingeloggt sind, unter <b>Mein ViMA öffnen -> Meine Einstellungen</b> einmalig festlegen, wann und ob Sie Benachrichtigungen per E-Mail erhalten wollen, z.B., wenn Sie neue Antworten auf Ihr <b>Suche-Biete</b> Inserat erhalten haben, oder eine neue Nachricht im Chat vorliegt. Sie können die Funktion auch jederzeit ändern, wenn Sie keine E-Mails mehr bekommen möchten.'
              },
              {
                title: 'Ich habe mein Passwort vergessen, was kann ich tun?',
                text: 'Unter <b>Einloggen</b> finden Sie die Möglichkeit, ein neues Passwort zu erstellen. Klicken Sie auf den Pfeil neben <b>Sie haben Ihr Passwort vergessen?</b>. Geben Sie dann die E-Mail-Adresse ein, mit der Sie sich registriert haben und Ihnen wird ein Link zugeschickt, über den Sie ein neues Passwort erstellen können.'
              },
              {
                title: 'Wie funktioniert der Meine Chats Bereich?',
                text: 'Der Chat hat zwei Funktionen: zum einen dient er der Kommunikation zu den Suche-Biete Inseraten. Sobald beide Parteien – also die Person, die das Inserat erstellt hat und der/die Interessent*in – miteinander in Kommunikation getreten sind, werden die Nachrichten in den Chat verschoben. Solange die Kommunikation noch einseitig ist, sehen Sie die Nachrichten unter Suche-Biete. Darüber hinaus können Sie die Chatfunktion über das Profil der registrierten Nutzer*innen nutzen und hier die Nutzer*innen, die Sie beispielsweise in den Interessengruppen kennengelernt haben, direkt anschreiben.<br>Bitte beachten Sie, dass die ViMA Plattform keine Partnerbörse ist!'
              }
            ]
          },
          {
            title: 'Suche-Biete',
            content: [
              {
                title: 'Wie erstelle ich ein Suche-Biete Inserat?',
                text: 'Wenn Sie eingeloggt sind, gehen Sie auf die <b>Suche-Biete</b> Seite, z.B. über das Drop Down Menü <b>Mitmachen</b>. Dann sehen Sie oben rechts den Button <b>Neues Inserat +</b>.'
              },
              {
                title: 'Wie formuliere ich mein Suche-Biete Inserat?',
                text: 'Beim Formulieren Ihres <b>Suche-Biete</b> Inserates seien Sie so konkret wie möglich. Stellen Sie sich vor, wie der/die ideale Interessent*in sein soll, der/die sich bei Ihnen melden soll. Umso genauer Sie sind, umso größer ist die Wahrscheinlichkeit, dass sich eine passende interessierte Person meldet. Bitte beachten Sie, dass Ihr Inserat anonym veröffentlicht wird. D.h. andere Nutzer*innen von ViMA lesen nur, was Sie im Inserat über sich schreiben, erfahren aber nicht Ihren Nutzernamen.'
              },
              {
                title: 'Warum ist mein Suche-Biete Inserat nicht auf der Website?',
                text: 'Jedes <b>Suche-Biete</b> Inserat wird erst von einem/einer Administrator*in der ViMA-Seite  geprüft und dann freigegeben. Damit stellen wir sicher, dass die Inserate unseren Richtlinien für die Plattform entsprechen. Wir versuchen nach Möglichkeit innerhalb von 24 Stunden zu reagieren.'
              },
              {
                title: 'Wie lange dauert es, bis mein Inserat freigegeben wird?',
                text: 'Unsere Administrator*innen versuchen nach Möglichkeit innerhalb von 24 Stunden zu reagieren. Sollte es einmal länger dauern, vor allem am Wochenende, bitten wir um Verständnis. Sie erhalten eine Nachricht, wenn Ihr Inserat freigegeben wurde.'
              },
              {
                title: 'Ich habe ein interessantes Inserat gefunden, was mache ich nun?',
                text: 'Unter dem Inserat ist eine Textbox für Ihre Nachricht. Seien Sie auch hier so konkret wie möglich: z.B. warum haben Sie Interesse an diesem Angebot, wer sind Sie, was hat Sie angesprochen, haben Sie einen Vorschlag? Bitte beachten Sie, dass die Person, an die Sie schreiben, mit Ihrer Antwort Zugriff auf alle Informationen hat, die Sie in Ihrem Profil für registrierte Nutzer*innen freigegeben haben.'
              },
              {
                title: 'Was passiert, wenn ich auf ein Inserat antworte?',
                text: 'Die Person, die das Inserat eingestellt hat, wird benachrichtigt und kann Ihre Nachricht lesen. Sobald sie antwortet, erfahren Sie, um welche Nutzer*in es sich handelt und Sie können Ihre Konversation mit dieser Person in Ihrem privaten Chat fortführen. Die andere Person hat ebenfalls Zugriff auf Ihr Profil. Wir gehen davon aus, dass der/die Interessent*in in der Regel in überschaubarer Zeit Ihre Nachricht liest und Ihnen antwortet. Sollte das nicht der Fall sein, bedauern wir das, es liegt aber nicht in unserer Verantwortung.'
              },
              {
                title: 'Was passiert, wenn jemand auf ein Inserat von mir antwortet?',
                text: 'Die Antworten auf ein Inserat können Sie unter <b>Mein ViMA -> Suche-Biete -> Interessent*innen</b> ansehen. Sobald Sie dort auf eine Anfrage antworten, wird die interessierte Person benachrichtigt und Sie können die Konversation in Ihrem privaten Chat fortführen.'
              }
            ]
          },
          {
            title: 'Beiträge erstellen',
            content: [
              {
                title: 'Keine der Kategorien passt zu meinem Beitrag – was soll ich tun?',
                text: 'Für <b>Suche-Biete</b> Inserate sowie <b>Interessengruppen</b> ist die Wahl mindestens einer Kategorie eine Pflichtangabe. Ohne diese Angabe können Sie Ihren Beitrag nicht veröffentlichen. Wählen Sie die Kategorie, die Ihrem Thema am nächsten kommt.'
              },
              {
                title: 'Was sind Schlagwörter?',
                text: 'Schlagwörter definieren den Inhalt Ihres jeweiligen Beitrags über die gewählte Kategorie hinaus. Sie machen es für andere Nutzer*innen einfacher, Ihren Beitrag zu finden. Im Sinne der Übersichtlichkeit empfehlen wir, nicht mehr als drei Schlagwörter zu nutzen.'
              },
              {
                title: 'Was passiert, wenn ich ein Schlagwort vorschlage?',
                text: 'Wenn es noch kein passendes Schlagwort zu Ihrem Thema in der Auswahlliste gibt, können Sie neue Schlagwörter vorschlagen. Ihre Vorschläge werden von den Administrator*innen geprüft und wenn passend freigegeben. Wenn freigegeben, können Sie das Schlagwort hinzufügen in dem Sie den jeweiligen Beitrag bearbeiten. Im Sinne der Übersichtlichkeit empfehlen wir für Ihre Beiträge nicht mehr als drei Schlagwörter zu nutzen.'
              }
            ]
          },
          {
            title: 'Interessengruppen',
            content: [
              {
                title: 'Wie kann ich die Interessengruppen nach meinen Interessen filtern?',
                text: 'Wenn Sie über <b>Mitmachen-> Interessengruppen</b> auf den Überblick der Interessengruppen gehen, sehen Sie über den Kacheln rechts den Button <b>Filter anzeigen</b>. Klicken Sie darauf und die verschiedenen Filtermöglichkeiten erscheinen. So können Sie leichter die Interessengruppen finden, die für Sie interessant sind.'
              },
              {
                title: 'Wie kann ich einer Interessengruppe beitreten?',
                text: 'Wenn Sie eingeloggt sind, gehen Sie auf die jeweilige Seite der Interessengruppe. Hier erscheint unter dem Namen der Interessengruppe ein Button <b>Mitgliedschaft beantragen</b>. Wenn Sie auf diesen klicken, erscheint eine Textbox. Bitte stellen Sie sich kurz vor und erläutern Sie, warum Sie dieser Gruppe beitreten möchten. Ihre Antwort wird dem/der Initiator*in der Interessengruppe weitergeleitet, die/der Ihre Anfrage nun annehmen oder ablehnen kann.'
              },
              {
                title: 'Ich will einer Interessengruppe beitreten, aber der Button Mitgliedschaft beantragen fehlt.',
                text: 'Dies bedeutet entweder, dass Sie Ihre Mitgliedschaft für diese Interessengruppe bereits beantragt haben. In diesem Fall erscheint neben dem Namen der Interessengruppe eine Sprechblase. Wenn Sie mit der Maus dorthin gehen, erscheint <b>Interessent*in</b>. Oder Ihre Anfrage wurde bereits angenommen und Sie sind bereits Mitglied. Dann erscheint neben dem Namen der Interessengruppe eine <b>Personen-Symbol</b>. Wenn Sie mit der Maus dorthin gehen, erscheint <b>Mitglied</b>. '
              },
              {
                title: 'Wie lange dauert es, bis meine Anfrage auf Mitgliedschaft zu einer Interessengruppe beantwortet wird?',
                text: 'Dies hängt davon ab, wie schnell der der/die Initiator*in der jeweiligen <b>Interessengruppe</b> reagieren kann und ist daher von Gruppe zu Gruppe unterschiedlich. Die Gruppeninitiator*innen sind in der Regel bemüht, so schnell wie möglich zu reagieren.'
              },
              {
                title: 'Wie gründe ich eine Interessengruppe?',
                text: 'Wenn Sie eingeloggt sind, gelangen Sie über <b>Mitmachen -> Interessengruppen</b> auf die Übersichtsseite. Oben rechts sehen Sie den Button Neue Interessengruppe. Bitte wählen Sie einen möglichst aussagekräftigen Namen für Ihre Gruppe und erklären Sie so detailliert wie möglich in der sich darunter befindenden Rubrik <b>Beschreibung</b>, worum es Ihnen geht und nach was für Mitgliedern Sie suchen. Bitte beachten Sie, dass jede <b>Interessengruppe</b> erst durch eine/n Administrator*in freigegeben werden muss. Sobald die von Ihnen beantragte Gruppe freigegeben wurde, erhalten Sie eine Benachrichtigung, dass Ihre Gruppe nun aktiv ist. Als Initiator*in einer <b>Interessengruppe</b> stellen Sie sicher, dass die Mitglieder sich an unsere Regeln halten. Zur Unterstützung können Sie andere Mitglieder zu Moderator*innen ernennen.'
              },
              {
                title: 'Warum kann ich meine Interessengruppe nicht sofort nach Erstellen sehen?',
                text: 'Jede Interessengruppe muss erst durch eine/n Administrator*in freigegeben werden.'
              },
              {
                title: 'Wie lange dauert es, bis meine Interessengruppe freigegeben wird?',
                text: 'Wir versuchen so schnell wie möglich, Ihr Gesuch freizugeben, dies sollte in der Regel innerhalb von 24 Stunden passieren. Bitte haben Sie Verständnis, vor allem am Wochenende, wenn es einmal länger dauert.'
              },
              {
                title: 'Wie kann ich Personen zu meiner Gruppe einladen?',
                text: 'Wenn Sie eingeloggt sind, sehen Sie unter <b>Mein ViMA öffnen -> Meine Interessengruppen</b> Ihre Gruppen. Wenn Sie Initiator*in oder Moderator*in einer Gruppe sind, können Sie über den Button in der Spalte <b>Mitglieder</b> andere registrierte Nutzer*innen zu Ihrer Gruppe einladen. Sie können dort auch sehen, wer aktuell Mitglied in Ihrer Gruppe ist, wen Sie bereits eingeladen haben und ob es offene Mitgliedschaftsanfragen gibt.'
              },
              {
                title: 'Wie kann ich einen bereits erstellten Beitrag ändern oder löschen?',
                text: 'Loggen Sie sich ein. Unter <b>Mein ViMA öffnen -> Meine Diskussionsthemen</b> können Sie Ihre Beiträge sehen und über Bearbeiten oder Löschen editieren. Dies gilt für alle Beiträge, die Sie im <b>Diskussionsforum</b> oder in einer <b>Interessengruppe</b> gepostet haben. Sind Sie Initiator*in einer Interessengruppe, dann können Sie den Text über Ihre Interessengruppe ändern, in dem Sie unter <b>Mein ViMA öffnen -> Meine Interessengruppen</b> die jeweilige Interessengruppe finden und dann auf <b>Bearbeiten</b> klicken. Bitte beachten Sie, dass Änderungen in diesem Bereich erst von den Administrator*innen freigegeben werden müssen.'
              },
              {
                title: 'Was ist die Aufgabe von Moderator*innen in den Interessengruppen?',
                text: 'Als Moderator*in unterstützen Sie den/die Initiator*in der Gruppe. Sie können auch Mitglieder zur Gruppe einladen. Sie können Impulse geben, um andere Mitglieder zum aktiven Mitmachen anzuregen. Uns ist es wichtig, dass jegliche Kommunikation auf der Plattform angemessen und respektvoll verläuft. Als Moderator*in achten Sie hierauf und lassen uns wissen, wenn Nutzer*innen gegen die Regeln verstoßen. Unsere Regeln finden Sie in den <b>Kommunikationsregeln</b>. Mitglieder Ihrer Gruppe können Beiträge bei Ihnen melden und müssen dabei begründen, warum der Beitrag gegen die Regel verstößt. Als Moderator*in und Initiator*in erhalten Sie dann eine Benachrichtigung, die Sie in <b>Meine Interessengruppen</b> unter Verstöße einsehen können. Sie können den entsprechenden Beitrag dann auch löschen. Wenn Sie hierzu Fragen haben und sich unsicher sind, wenden Sie sich gerne an uns unter vima@ileu.net.'
              },
              {
                title: 'Wie ernenne ich eine/n Moderator*in für meine Interessengruppe?',
                text: 'Wenn Sie eingeloggt sind, sehen Sie unter <b>Mein ViMA öffnen -> Meine Interessengruppen</b> Ihre Gruppen. Wenn Sie Initiator*in einer Gruppe sind, können Sie nun über den Button in der Spalte <b>Moderator*innen</b> ein Gruppenmitglied zum/zur Moderator*in ernennen.'
              },
              {
                title: 'Wie kann ich Moderator*in einer Interessengruppe werden?',
                text: 'Nur der/die jeweilige Gruppeninitiator*in kann Sie zum Moderator/zur Moderatorin ernennen. Wenn Sie Interesse an dieser Aufgabe haben, kontaktieren Sie den/die Initiator*in direkt, z.B. über den Chat.'
              }
            ]
          },
          {
            title: 'Diskussionsforum',
            content: [
              {
                title: 'Warum kann ich im Diskussionsforum keine Diskussion starten?',
                text: 'Das Diskussionsforum ist im Moment noch in der Testphase. Daher können Diskussionen noch nicht von Nutzenden erstellt werden. Sie können aber in bestehenden Diskussionen mitdiskutieren, wenn Sie registriert sind.'
              },
              {
                title: 'Wie kann ich einen bereits erstellten Beitrag ändern oder löschen?',
                text: 'Loggen Sie sich ein. Unter <b>Mein ViMA öffnen -> Meine Diskussionsthemen</b> können Sie Ihre Beiträge sehen und über die Buttons <b>Bearbeiten</b> oder <b>Löschen</b> editieren. Dies gilt für Beiträge, die Sie im Diskussionsforum oder in einer Interessengruppe gepostet haben.'
              },
              {
                title: 'Was bedeutet der Stern neben den Diskussionsüberschriften?',
                text: 'Wenn Sie den Stern anklicken, abonnieren Sie diesen Diskussionsstrang und werden informiert, wenn neue Beiträge gepostet werden. Dies gilt für Diskussionsstränge innerhalb einer Interessengruppe sowie im Diskussionsforum. Für diese Möglichkeit müssen Sie eingeloggt sein.'
              }
            ]
          },
          {
            title: 'Veranstaltungen',
            content: [
              {
                title: 'Welche Art von Veranstaltungen werden veröffentlicht?',
                text: 'Wir posten in erster Linie relevante Veranstaltungen in Ulm und Umgebung. Unsere Kooperationspartner können hier in Zukunft ebenfalls ihre Veranstaltungen veröffentlichen.'
              },
              {
                title: 'Kann ich bei den Administrator*innen die Aufnahme einer Veranstaltung beantragen?',
                text: 'Gerne nehmen wir Vorschläge für relevante Veranstaltungen in Ulm und Umgebung entgegen. Wenn Sie Teil der Organisation sind, die die Veranstaltung ausrichtet, kontaktieren Sie uns über vima@ileu.net.'
              },
              {
                title: 'Kann ich selbst eine Veranstaltung posten?',
                text: 'Veranstaltungen können derzeit nur über uns erstellt werden. Gerne nehmen wir Vorschläge für relevante Veranstaltungen in Ulm und Umgebung entgegen (vima@ileu.net).'
              }
            ]
          },
          {
            title: 'Kooperationspartner',
            content: [
              {
                title: 'Dieser Bereich ist derzeit noch im Aufbau',
                text: ''
              }
            ]
          },
          {
            title: 'Newsletter',
            content: [
              {
                title: 'Wie kann ich mich für den Newsletter anmelden?',
                text: 'Klicken Sie unten auf der Website auf Newsletter abonnieren. Als registrierter Nutzer*in können Sie Ihr Newsletter Abo unter <b>Mein ViMA öffnen -> Meine Einstellungen</b> verwalten.'
              },
              {
                title: 'Wer ist verantwortlich für die ViMA Plattform?',
                text: 'ViMA (Virtuell.Mitmachen.Aktiv! in Ulm) wird von ILEU e.V. (Institut für virtuelles und reales Lernen in der Erwachsenenbildung an der Universität Ulm e.V.) betrieben und gefördert im Rahmen des Projekts "Ulm4CleverCity – Smart City Modellstadt“ durch die Geschäftsstelle Digitale Agenda der Stadt Ulm.'
              }
            ]
          },
          {
            title: 'Nutzer / Beiträge melden',
            content: [
              {
                title: 'Was passiert, wenn ich eine/n Nutzer*in blockiere?',
                text: 'Sie können Nutzer*innen im Chat blockieren und auch wieder entblocken (<b>Mein ViMA öffnen -> Meine Chats</b>). Blockierte Nutzer*innen können Ihnen keine Nachrichten mehr über den Chat schicken. Hier sehen Sie auch, wenn ein/e andere/r Nutzer*in Sie blockiert hat. Wenn Sie einen Nutzer*in melden möchten, nutzen Sie die Meldefunktion (drei Punkte) unterhalb des betreffenden Beitrags/der betreffenden Chatnachricht des Nutzers/der Nutzerin.'
              },
              {
                title: 'Wie kann ich einen Nutzer/eine Nutzerin bei den Verantwortlichen für ViMA melden?',
                text: 'Sie können Beiträge von Nutzern über die drei Punkte unterhalb des betreffenden Beitrags melden. Bitte geben Sie den Grund für Ihre Meldung in der Box an, die erscheint, wenn Sie auf <b>Melden</b> klicken. Ihre Nachricht wird an unsere Administrator*innen weitergeleitet, die so schnell wie möglich reagieren. Meldungen von Verstößen innerhalb von Interessengruppen werden an die Initiatoren*innen und Moderatoren*innen der jeweiligen Interessengruppe weitergeleitet.'
              },
              {
                title: 'Wie kann ich einen Beitrag melden?',
                text: 'Beiträge, die gegen unsere Kommunikationsrichtlinien verstoßen, können Sie über den Button mit den drei Punkten, der unterhalb jedes Beitrags erscheint, melden. Wenn Sie auf <b>Melden</b> klicken, erscheint eine Textbox. Bitte geben Sie hier eine kurze Begründung an, warum Sie den Beitrag melden. Die Meldung wird direkt an unsere Administrator*innen geschickt, die so schnell wie möglich reagieren. Meldungen von Verstößen innerhalb von Interessengruppen werden an die Initiatoren*innen und Moderatoren*innen der jeweiligen Interessengruppe weitergeleitet.'
              }
            ]
          },
          {
            title: 'Sonstiges',
            content: [
              {
                title: 'Allgemein',
                text: 'Sollten Sie Probleme haben die Webseite zu laden oder neue Beiträge zu sehen, empfehlen wir Ihnen die Webseite einige Male neu zu laden (Refresh oder die Tastenkombination Strg und R).'
              }
            ]
          }
        ],
      en: [
        {
          title: 'Profile',
          content: [
            {
              title: 'Why do I need to create a profile?',
              text: 'For administrative reasons, everybody who wants to become active on ViMA must create a profile. The email address is only accessible to the administrator. Username, photo and about me are optional and visible to all registered users. Age, gender and place of residence are mandatory for statistical purposes.'
            },
            {
              title: 'What can I do once I have created a profile?',
              text: 'To actively participate in ViMA, you need a profile. This allows you to create Search / Offer ads or to reply to already existing ads. You can join and create interest groups. And you can participate in discussion forums.'
            },
            {
              title: 'Who can visit my profile?',
              text: 'Only registered users can visit and view your profile. You can also specify whether your age, gender and place of residence should be visible to other registered users or to administrators only at  <b>Open My ViMA -> My Settings</b>.'
            },
            {
              title: 'What is a username?',
              text: 'When you create your profile, you must choose a username. You can decide which name you want to use to be visible to others. That could be your name or a nickname of your choice. Your username will be visible to website visitors and to registered users. Your posts in the discussion forum as well as in the public interest groups will be assigned to your username. You will also appear in the member search with your username. Your Search /Offer advertisements are  posted anonymously.'
            },
            {
              title: 'Which details of my profile will be visible to others?',
              text: 'Your username, your picture and the About me section will be visible. We ask for details such as your age, gender and place of residence for statistical reasons only. It is entirely up to you for whom your age, gender and place of residence will be visible: for administrators only or for registered users also.'
            },
            {
              title: 'How do I change my profile data?',
              text: 'To change your profile data, you must be logged in. Click <b>Open my ViMA</b>, there you can change your profile data at  <b>My profile data</b>. You then need to save your changes by clicking <b>saving data</b> - at the very bottom of the page.'
            },
            {
              title: 'How do I delete my profile?',
              text: 'You can delete your profile at any time. When you are logged in, go to <b>Open my ViMA-> My profile data</b> and at the bottom of the page click <b>Delete profile permanently</b>.'
            },
            {
              title: 'What happens to my posts when I delete my profile?',
              text: 'If you delete your profile, your ads in <b>Search / Offer</b> will be deleted as well. Your posts in the interest groups and discussion forums remain, but anonymously, i.e. without a link to your username. If want to delete your posts as well, remove them before deleting your profile.'
            },
            {
              title: 'Can others delete my profile?',
              text: 'Your profile can only be deleted by yourself or the administrators.'
            },
            {
              title: "I don't live in Ulm, can I still register?",
              text: 'Of course! Anyone who supports the ViMA concept can join in actively. ViMA offers the opportunity to network virtually and exchange ideas about topics of common interest.'
            },
            {
              title: 'What information should be provided in About Me?',
              text: 'This is up to you. Share as much as you like about your interests or background, but keep in mind that anything you write about yourself will be visible to all registered users.'
            },
            {
              title: 'Do I need to upload a picture in my profile?',
              text: 'It is up to you to upload a profile picture, but a picture makes it easier for users to recognize you. You can use a picture of yourself or any picture identifying you. Please note that you should only use pictures for which you own the copyright.'
            },
            {
              title: 'What does Copyright mean when I upload a picture?',
              text: "In your profile and posts, you should only use pictures for which you own the copyright. So in this field, please enter your name if you own the picture copyright, or indicate the person with whose consent you are using the picture. Please note that this applies to your profile picture as well as to pictures in the 'Search / Offer' advertisements or interest groups."
            }
          ]
        },
        {
          title: 'My ViMA',
          content: [
            {
              title: 'What is Open My ViMA?',
              text: 'If you are logged in, you have access to your personal ViMA area at <b>Open my ViMA</b>: Here you can find your profile data and access to your advertisements as well as posts in your interest groups and the discussion forums. At <b>Find members</b>, you can find other members by searching for their usernames and you also can write to them via the chat function. At <b>My settings</b>, you can decide when you want to receive notifications about your activities by e-mail and which details should be visible to whom. At <b>My profile data -> Edit profile</b> you can change your profile data. If you want to delete your profile, click <b>Delete profile permanently</b> at the bottom left of this page. Please do not forget to click <b>Save data</b> after each change.'
            },
            {
              title: 'Where do I see my Search / Offer ad',
              text: 'If you are logged in, you can find your advertisements at <b>My ViMA</b> by clicking <b>My Search / Offer</b>. In this overview, you can also edit or delete your advertisement. At <b>Interested parties</b> you can see who replied to your ad. Here you can also view all the advertisements to which you have replied. You can see them when  the column <b>Relation interested party</b> is displayed. For your own advertisement you find the following at <b>Relation initiator</b>.'
            },
            {
              title: 'When will I receive emails from ViMA?',
              text: 'If you are logged in, you can configure if and when you want to receive notifications by e-mail, e.g. when you have received new replies to your <b>Search / Offer</b> ad, or there is a new message for you in the chat, at <b>Open my ViMA -> My settings</b>. If you do not want that, you can set that you are not to be notified at any time. In that case, we ask you to log in regularly to check whether you have received messages so that they do not go unanswered.'
            },
            {
              title: 'Should I log out each time and then log in again?',
              text: 'This is up to you. If the device you use to log in is also used by others, we recommend that you log out each time so that no one else has unintentional access to your profile. Otherwise, it is of course very convenient to stay logged in because you can then access my <b>Open my ViMA</b> right away.'
            },
            {
              title: 'How do I see whether I have new messages?',
              text: 'If there are news for you, an exclamation mark will appear next to <b>Open my ViMAb</b>. If you now open the drop-down menu, you will see another exclamation mark next to the area where there are  news for you. You can also receive notifications by email if you want. To do so, you must log in and go to <b>Open my ViMA -> My settings</b> to define when and if you want to receive notifications by e-mail, e.g. if you have received new replies to your <b>Search / Offer</b> advertisement, or if there is a new message in the chat. You can also change this function at any time if you do not want to receive e-mails any longer.'
            },
            {
              title: 'I forgot my password, what can I do?',
              text: 'At <b>Log in</b> you can find the option to create a new password. Click on the arrow next to <b>Forgot your password?</b>. Then enter the email address you have used to register and a link will be sent to you to create a new password.'
            },
            {
              title: 'How does the My Chats section work?',
              text: 'The chat has two functions: first, it is used to communicate with the Search / Offer advertisements. As soon as both parties - the person who has created the advertisement and the interested party - have begun to communicate, the messages will be moved to the chat. As long as only one party has sent a message, you can view it at Search / Offer. You can also use the profile chat function of registered users and write, e.g., directly to the users you have met in the interest groups. <b>Please note that the ViMA platform is not a dating site!'
            }
          ]
        },
        {
          title: 'Search / Offer',
          content: [
            {
              title: 'How do I create a Search / Offer ad?',
              text: 'When you are logged in, go to the <b>Search / Offer</b> page, e.g. via the <b>Join</b> drop-down menu. Then you can see the <b>New ads +</b> button in the top right corner.'
            },
            {
              title: 'How do I word my Search / Offer ad?',
              text: 'When writing your <b>Search / Offer</b> ads, be as specific as possible. Imagine what you want the person who is supposed to contact you to be like. The more specific you are, the more likely it is that a matching interested person contacts you. Please note that your ad  will be published anonymously. This means that other ViMA users will only be able to read what you write about yourself in the ad, but not find out your user name.'
            },
            {
              title: 'Why is my Search / Offer ad not on the website?',
              text: 'Every <b>Search / Offer</b> advertisement has to be approved by an administrator of the ViMA site and then released. This will ensure that advertisements comply with our guidelines for the platform. We try to react within 24 hours if possible.'
            },
            {
              title: 'How long will it take for my ad to be approved?',
              text: 'Our administrators try to react within 24 hours. We ask for your understanding if that should take longer, especially at the weekends. You will receive a message as soon as your advertisement is released.'
            },
            {
              title: 'I have found an interesting ad, what do I do now?',
              text: 'Below the ad you can find a "text"box for your message. Again, be as specific as possible: e.g. why are you interested in this offer, who you are, what has appealed to you, do you have a suggestion? Please note that the person you are writing to will have  access to all the information you have shared with registered users in your profile.'
            },
            {
              title: 'What happens when I reply to an advertisement?',
              text: 'The person who posted the ad will be notified and can read your message. As soon as they reply, you know who they are and you can continue your conversation with them in your private chat. The other person also has access to your profile. We assume that the interested party usually reads your message and replys to you within a reasonable time. If they do not, we regret that, but that is not within the scope of our responsibility.'
            },
            {
              title: 'What happens when someone replies to one of my ads?',
              text: 'You can view the replies to an ad at <b>My ViMA -> Search / Offer -> Interested Parties</b>. As soon as you reply to a request there, the interested person will be notified and you can continue the conversation in your private chat.'
            }
          ]
        },
        {
          title: 'Create Posts',
          content: [
            {
              title: 'None of the categories fit my post - what should I do?',
              text: 'For <b>Search / Offer</b> ads as well as <b>Interest Groups</b>, it is mandatory to select at least one category. Without this detail you will not be able to publish your post. Select the category that comes closest to your topic. '
            },
            {
              title: 'What are keywords?',
              text: 'Keywords define the content of your post beyond the selected category. They will make it easier for other users to find your post. We recommend to use not more than three keywords, otherwise it might become confusing.'
            },
            {
              title: 'What happens when I suggest a keyword?',
              text: 'If there is not yet a suitable keyword for your topic in the selection list, you can suggest new keywords. Your suggestions will be checked by the administrators and approved if they are suitable. If approved, you can add the keyword by editing the respective post. We recommend to use not more than three keywords for your posts, otherwise it might become confusing.'
            }
          ]
        },
        {
          title: 'Interest Groups',
          content: [
            {
              title: 'How can I filter interest groups according to my interests?',
              text: 'If you go to the overview of the interest groups via <b>Join-> Interest groups</b>, you can see the <b>Show filter</b> button  above the tiles at the right. Click it and the different filter options will appear. This makes it easier for you to find the interest groups that are of interest to you.'
            },
            {
              title: 'How can I join an interest group?',
              text: 'When you are logged in, go to the page of the interest group. An <b>Apply for membership</b> button will appear under the name of the interest group. When you click it, a "text" box will appear. Please briefly introduce yourself and explain why you would like to join this group. Your answer will be forwarded to the initiator of the interest group, who can then accept or reject your request.'
            },
            {
              title: 'I want to join an interest group, but there is no  Request membership button.',
              text: 'This means that either you have already requested your membership for this interest group. A bubble will then appear next to the name of the interest group. When you hover the mouse over it,  <b>Interested</b> will appear. Or, your request has already been accepted and you are a member already. In this case, a <b>person</b> symbol will appear next to the name of the interest group. If you hover the mouse over it, <b>Member</b> will appear. '
            },
            {
              title: 'How long will it take for my request for membership in an interest group to be answered?',
              text: 'This depends on how quickly the initiator of the <b>interest group</b> can react and therefore varies from group to group. The group initiators usually try to react as quickly as possible.'
            },
            {
              title: 'How do I set up an interest group?',
              text: 'If you are logged in, you can access the overview page at <b>Join -> Interest groups</b>. At the top right you see the button New interest group. Please choose a descriptive name for your group and explain in the <b>Description</b> section below what you are interested in and what type of members you are looking for. Please note that each <b>interest group</b> must first be approved by an administrator. As soon as the group you requested has been approved, you will receive a notification that your group is now active. As the initiator of an <b>interest group</b>, you must ensure that the members abide by our rules. You can appoint other members as moderators to support you.'
            },
            {
              title: "Why can't I see my interest group immediately after creating it?",
              text: 'Each interest group must first be approved by an administrator.'
            },
            {
              title: 'How long will it take for my interest group to be approved?',
              text: 'We try to approve your request as soon as possible, this should usually be done within 24 hours. We ask for your understanding if that should take longer, especially at the weekends.'
            },
            {
              title: 'How can I invite people to my group?',
              text: 'When you are logged in, you can see your groups at  <b>Open my ViMA -> My interest groups</b>. If you are the initiator or moderator of a group, you can invite other registered users to your group by clicking the button in the <b>Members</b> column. You can also see who is currently a member of your group, who you have already invited, and if there are any open membership requests.'
            },
            {
              title: 'How can I change or delete an existing post?',
              text: 'Log in. At <b>Open my ViMA -> My discussion topics</b> you can see your posts and edit them via Edit or Delete. This applies to all entries you have posted in the <b>Discussion forum</b> or in an <b>Interest group</b>. If you are the initiator of an interest group, you can change the "text" of your interest group by accessing <b>Open my ViMA -> My interest groups</b> and clicking on <b>Edit</b>. Please note that any changes in this area must first be approved by the administrators.'
            },
            {
              title: 'What is the role of moderators in the interest groups?',
              text: 'As a moderator, you support the initiator of the group. You can also invite members to the group. And you can also encourage other members to actively participate. It is important to us that all communication on the platform will be suitable and respectful. As a moderator, you will need to watch that and let us know if users break the rules. You can find our rules at <b>Communication rules</b>.'
            },
            {
              title: 'How do I appoint a moderator for my interest group?',
              text: 'If you are logged in, you can see your groups at  <b>Open my ViMA -> My interest groups</b>. If you are the initiator of a group, you can now appoint a group member as moderator by clicking the button in the <b>Moderators</b> column.'
            },
            {
              title: 'How do I become a moderator of an interest group?',
              text: 'Only the group initiator can appoint you as a moderator. If you are interested in acting as a moderator, please contact the initiator directly, e.g. via the chat.'
            }
          ]
        },
        {
          title: 'Discussion Forum',
          content: [
            {
              title: "Why can't I start a discussion in the discussion forum?",
              text: 'The discussion forum is currently still in the test phase. Therefore, discussions cannot yet be created by users. However, you can join existing discussions if you are registered.'
            },
            {
              title: 'How can I change or delete an existing post?',
              text: 'Please log in first. At <b>Open my ViMA -> My discussion topics</b> you can view your posts and edit them using the <b>Edit</b> or <b>Delete</b> buttons. This applies to entries you have posted in the discussion forum or in an interest group.'
            },
            {
              title: 'What does the star next to the discussion titles mean?',
              text: 'If you click the star, you subscribe to this discussion thread and will be informed as soon as new ads are posted. This goes for discussion forums within an interest group as well as in the discussion forum. You must be logged in to use this option.'
            }
          ]
        },
        {
          title: 'Events',
          content: [
            {
              title: 'What type of events will be published?',
              text: 'We mainly post important events in Ulm and surroundings . In future, our cooperation partners will also be able to publish their own events here.'
            },
            {
              title: 'Can I ask the administrators to include an event?',
              text: 'We will be happy to receive suggestions for important  events in Ulm and surroundings . If you are part of the organization hosting the event, please contact us at vima@ileu.net.'
            },
            {
              title: 'Can I post an event on my own?',
              text: 'Today, only we can enter events for cooperation partners. Please contact us at vima@ileu.net to let us have more infomation about cooperation partnerships. We will be happy to receive suggestions for important events in Ulm and surroundings .'
            }
          ]
        },
        {
          title: 'Cooperation Partners',
          content: [
            {
              title: 'This area is currently still under construction',
              text: ''
            }
          ]
        },
        {
          title: 'Newsletter',
          content: [
            {
              title: 'How can I subscribe to the newsletter?',
              text: 'Click Subscribe to Newsletter at the bottom of the website. As a registered user you can manage your newsletter subscription at <b>Open my ViMA -> My settings</b>.'
            },
            {
              title: 'Who is responsible for the ViMA platform?',
              text: "ViMA (Virtuell. Mitmachen. Aktiv! in Ulm) is run by ILEU e.V. (Institute for Virtual and Real Learning in Adult Education at the University of Ulm e.V.) and funded as part of the project 'Ulm4CleverCity - Smart City Model City' by the Digital Agenda Office of the City of Ulm."
            }
          ]
        },
        {
          title: 'Reporting Users/Posts',
          content: [
            {
              title: 'What happens when I block a user?',
              text: 'You can block and unblock users in the chat (<b>Open My ViMA -> My Chats</b>). Blocked users can no longer use the chat to send you messages. Here, you can also see when another user has blocked you. If you want to report a user, use the report function (three dots) below the post/chat message of that user.'
            },
            {
              title: 'How can I report a user to the people responsible for ViMA?',
              text: 'You can report user posts by using the three dots below that post. Please give the reason for your report in the box that appears when you click <b>Report</b>. Your message will be forwarded to our administrators who will answer as soon as possible. Reports of violations within interest groups will be forwarded to the initiators and moderators of that interest group.'
            },
            {
              title: 'How can I report a post?',
              text: 'You can report posts that violate our communication guidelines using the button with the three dots that appears below each post. When you click <b>Report</b>, a <b>text</b> box appears. Please provide a brief explanation of why you are reporting the post. The report is sent directly to our administrators, who will answer as quickly as possible. Reports of violations within interest groups will be forwarded to the initiators and moderators of that interest group.'
            }
          ]
        },
        {
          title: 'Other',
          content: [
            {
              title: 'General',
              text: 'Should you encounter problems loading the website or seeing new posts, we recommend to reload the website a few times (Refresh or the combination of keys <Ctrl> + <R>)..'
            }
          ]
        }
      ],
      ro: [
        {
          title: 'Profil',
          content: [
            {
              title: 'De ce trebuie să creez un profil?',
              text: 'Din motive administrative, toți cei care doresc să fie activi pe platforma ViMA trebuie să își creeze un profil. Adresa de e-mail este accesibilă doar administratorilor. Numele de utilizator, fotografia și detalii personale sunt opționale și pentru toți utilizatorii înregistrați vizibile. Informații despre vârstă, sex și locul de reședință sunt obligatorii în scopuri statistice. Puteți specifica în <b>Setările mele</b> pentru cine sunt vizibile aceste informații.'
            },
            {
              title: 'Ce pot face după ce am creat un profil?',
              text: 'Pentru a participa activ pe platforma ViMA, aveți nevoie de un profil. Cu acesta puteți crea anunțuri în zonele de căutare sau puteți răspunde la anunțurile existente. Vă puteți alătura și crea grupuri de interese. Și puteți participa la forumuri de discuții.'
            },
            {
              title: 'Cine poate să îmi viziteze profilul?',
              text: 'Doar utilizatorii înregistrați vă pot vizita și vizualiza profilul. Sub <b>Deschide profilul meu -> Setările mele</b>, puteți specifica, de asemenea, dacă informațiile dvs. despre vârstă, sex și locul de reședință pot fi vizibile pentru alți utilizatori înregistrați sau numai pentru administratori.'
            },
            {
              title: 'Ce este un nume de utilizator?',
              text: 'Când vă creați profilul, trebuie să alegeți un nume de utilizator. Dvs. decideți sub ce nume vreți să fiți vizibil/ă pentru ceilalți. Acesta poate fi numele dvs. sau o poreclă care poate fi selectată în mod liber. Numele dvs. de utilizator este vizibil pentru vizitatorii site-ului web și pentru utilizatorii înregistrați. Postările dvs. din forumul de discuții și din grupurile de interes public sunt atribuite numelui Dvs. de utilizator. Numele dvs. de utilizator va apărea și în spațiul de căutare a membrilor. Anunțurile dvs. din categoria Căutare-Ofertă/Ofer vor fi postate anonim.'
            },
            {
              title: 'Ce informații din profilul meu sunt vizibile pentru alții?',
              text: 'Asta depinde în întregime de dvs. Puteți împărți oricât de mult informații doriți despre interesele sau viața dvs., dar sa țineți cont de faptul că tot ce scrieți despre dvs. este vizibil pentru toți utilizatorii înregistrați.'
            },
            {
              title: 'Cum îmi modific datele de profil?',
              text: 'Pentru a vă schimba datele de profil, trebuie să fiți autentificat. Sub <b>Deschide contul meu ViMA</b>, vă puteți schimba detaliile în <b>Datele profilului meu</b>. Apoi, trebuie să salvați modificările cu <b>Salvare date</b> în partea de jos a paginii.'
            },
            {
              title: 'Cum îmi șterg profilul?',
              text: 'Vă puteți șterge profilul oricând. Dacă sunteți autentificat, accesați <b>Deschideți ViMA->Datele mele profil</b>, în partea de jos a paginii faceți clic pe <b>Ștergeți permanent profilul</b>.'
            },
            {
              title: 'Ce se întâmplă cu postările mele dacă îmi șterg profilul?',
              text: 'Dacă vă ștergeți profilul, anunțurile dvs. din categoria <b>Căutare-Ofertă/Ofer</b> vor fi și ele șterse. Contribuțiile dvs. la grupurile de interese și forumurile de discuții vor rămâne, dar anonime, adică nu sunt legate de numele dvs. de utilizator. Dacă doriți ca postările dvs. să fie șterse atunci când vă ștergeți profilul, atunci ștergeți-le înainte de a vă șterge profilul.'
            },
            {
              title: 'Poate fi profilul meu șters de către alții?',
              text: 'Profilul dvs. poate fi șters doar de dvs. sau de administratori.'
            },
            {
              title: 'Dacă nu locuiesc in Ulm, am voie să mă înregistrez pe ViMA?',
              text: 'Desigur! Oricine susține ideea ViMA poate participa activ la ViMA, deoarece ViMA oferă posibilitatea de a crea rețele virtual și de a face schimb de idei pe subiecte de interes comun.'
            },
            {
              title: 'Ce informații aparțin de rubrica Despre mine?',
              text: 'Asta depinde în întregime de dvs. Puteți împărți oricât de mult informații doriți despre interesele sau viața dvs., dar sa țineți cont de faptul că tot ce scrieți despre dvs. este vizibil pentru toți utilizatorii înregistrați.'
            },
            {
              title: 'Trebuie să adaug o poză la profilul meu??',
              text: 'Încărcarea unei fotografii de profil depinde de dvs., dar o fotografie de profil facilitează recunoașterea utilizatorilor. Puteți să vă folosiți o poză cu dvs. sau o poză care vă descrie. Vă rugăm să vă asigurați că utilizați numai imagini pentru care aveți dreptul de autor.'
            },
            {
              title: 'Ce înseamnă imaginea autorului când încarc o imagine?',
              text: 'În profilul și postările dvs., puteți utiliza numai imagini pentru care dețineți drepturile de autor. Vă rugăm să vă introduceți numele în acest câmp dacă aveți dreptul de autor asupra imaginii sau să indicați persoana cu acordul căreia postați imaginea ca autor. Vă rugăm să rețineți că acest lucru se aplică imaginii dvs. de profil, precum și imaginilor din anunțurile <b>Căutare-Ofertă-Ofer</b> sau din grupurile de interese.'
            }
          ]
        },
        {
          title: 'Profilul meu ViMA',
          content: [
            {
              title: 'Ce se ascunde în spatele Profilului personal de ViMA?',
              text: 'Dacă sunteți autentificat, aveți acces la zona dvs. personală ViMA sub <b>Deschide profilul meu ViMA</b>: Aici veți găsi datele de profil și veți avea acces la postările și contribuțiile dvs. în grupurile de interese și forumurile de discuții. Sub <b>Găsiți membri</b> puteți găsi alți membri folosind numele lor de utilizator și le puteți scrie prin intermediul funcției de chat. Sub <b>Setările mele</b> puteți decide în ce cazuri doriți să primiți notificări despre activitățile dvs. prin e-mail și care informații ar trebui să fie vizibile pentru alți utilizatori. Vă puteți modifica datele profilului în <b>Datele profilului meu -> Editați profilul</b>. Dacă doriți să vă ștergeți profilul, faceți clic pe <b>Ștergeți profilul definitiv</b> în partea stângă jos a acestei pagini. Nu uitați să faceți clic pe <b>Salvați datele</b> de fiecare dată când faceți o modificare.'
            },
            {
              title: 'Under pot vedea anunțurile mele de Căutare-Ofertă/Ofer?',
              text: 'Dacă sunteți autentificat, veți găsi anunțurile dvs. sub <b>Deschideți profilul meu ViMA</b> făcând clic pe <b>Căutarea mea/Licitarea mea</b>. De asemenea, puteți edita sau șterge anunțul dvs. în această vizualizare. Sub <b>Interesați</b> puteți vedea cine a răspuns la anunțul dvs. Aici puteți vedea și toate anunțurile la care ați răspuns dvs.. Puteți recunoaște acest lucru când sub coloană scrie <b>Persoană interesată</b>. Sub propriul anunț scrie <b>Relație de Inițiator</b>.'
            },
            {
              title: 'Când voi primi e-mailuri de la platforma ViMA?',
              text: 'Dacă sunteți autentificat, sub <b>Deschide profilul meu ViMA -> Setările mele</b>, stabiliți dacă și când doriți să primiți notificări prin e-mail, de exemplu dacă aveți răspunsuri noi la <b>Căutare-Ofertă</b> sau aveți un mesaj nou în chat. Dacă nu doriți acest lucru, puteți alege să nu fiți niciodată notificat. În acest caz, vă rugăm să vă conectați în mod regulat pentru a verifica dacă ați primit mesaje, astfel încât acestea să nu rămână fără răspuns.'
            },
            {
              title: 'Ar trebui să mă deconectez și apoi să mă autentific din nou de fiecare dată când accesez platforma ViMA?',
              text: 'Depinde de dvs.. Dacă dispozitivul pe care îl utilizați pentru a vă conecta este folosit și de alții, vă recomandăm să vă deconectați de fiecare dată, astfel încât nimeni altcineva să nu aibă acces neintenționat la profilul dvs. În caz contrar, este bineînțeles foarte practic dacă rămâneți conectat, pentru că atunci poți accesa imediat rubrica <b>Deschide profilul meu ViMA</b>.'
            },
            {
              title: 'Cum pot vedea că am primit mesaje noi?',
              text: 'Dacă există mesaje pentru dvs., un semn de exclamare va apărea lângă <b>Deschideți profilul meu ViMA</b>. Dacă deschideți acum meniul drop-down, veți vedea un alt semn de exclamare lângă categoria în care există ceva nou pentru dvs. Puteți primi notificări și prin e-mail dacă doriți. Pentru a face acest lucru, când sunteți autentificat, accesați <b>Deschide profilul ViMA -> Setările mele</b> și specificați dacă și când doriți să primiți notificări prin e-mail, de exemplu, dacă ați primit răspunsuri noi la anunțul dvs. din categoria  <b>Căutare-Ofertă</b> sau un mesaj nou în chat. Puteți de asemenea să modificați această opțiune în orice moment dacă nu mai doriți să primiți e-mailuri.'
            },
            {
              title: 'Am uitat parola, ce pot face acum?',
              text: 'Sub <b>Autentificare</b> veți găsi opțiunea de a crea o nouă parolă. Faceți clic pe săgeata de lângă <b>V-ați uitat parola?</b>. Apoi introduceți adresa de e-mail cu care v-ați înregistrat și vi se va trimite un link pentru a crea o nouă parolă.'
            },
            {
              title: 'Cum funcționează secțiunea Chaturile mele?',
              text: 'Chat-ul are două funcții: pe de o parte, servește pentru a comunica cu persoanele interesate din secțiunea căutare-ofertă. Imediat ce ambele părți - adică persoana care a creat postarea și partea interesată - au comunicat între ele, mesajele sunt mutate în chat. Atâta timp cât comunicarea este încă unidirecțională, veți vedea mesajele sub Căutare-Ofertă. În plus, puteți folosi funcția de chat prin profilul utilizatorului înregistrat și puteți scrie direct utilizatorilor pe care i-ați întâlnit în grupurile de interese. <br>Rețineți că platforma ViMA nu este un site de întâlniri!'
            }
          ]
        },
        {
          title: 'Căutare-Ofertă',
          content: [
            {
              title: 'Cum pot crea o postare în secțiunea Căutare-Ofertă?',
              text: 'Dacă sunteți autentificat, accesați pagina <b>Căutare-Ofertă</b>, de exemplu accesând categoria din meniu <b>Înscrieți-vă</b>. Apoi veți vedea în dreapta sus butonul <b>Anunț nou +</b>.'
            },
            {
              title: 'Cum pot face o postare în categoria Căutare-Ofertă?',
              text: 'Când încercați să faceți o postare în categoria <b>Căutare-Ofertă</b> scrieți cat mai concret cu putință. Imaginațivă cum ar trebui să fie persoana ideală care ar putea răspunde la anunț. Cu cât formulați anunțul mai concret, cu atât va vor răspunde mai multe persoane. Țineți cont de faptul că anunțul dvs. va fi inserat în mod anonim. Toate persoanele autentificate pe platforma ViMA vă pot citi anunțul dar nu vă pot citi numele de utilizator.'
            },
            {
              title: 'De ce nu este anunțul meu din rubrica Căutare-Ofertă vizibil pe Website?',
              text: 'Fiecare anunț din rubrica <b>Căutare-Ofertă</b> este controlat mai întâi de administratorul platformei și apoi este aprobat. În acest fel ne asigurăm ca anunțurile îndeplinesc condițiile de publicare. Noi încercăm să aprobăm toate anunțurile în mai puțin de 24 ore.'
            },
            {
              title: 'Cât timp durează până când anunțul meu este aprobat?',
              text: 'Administratorii noștri încearcă să răspundă în 24 de ore dacă este posibil. Dacă durează mai mult, mai ales în weekend, vă rugăm să ne acordați înțelegere. Veți primi un mesaj când anunțul dvs. va fi aprobat.'
            },
            {
              title: 'Am găsit un anunț interesant, ce fac acum?',
              text: 'Sub anunț găsiți un spațiu pentru "text" mesajul dvs . Fiți cât mai specific și aici: de exemplu, de ce sunteți interesat de această ofertă, cine sunteți, aveți poate o sugestie? Vă rugăm să rețineți că, odată cu răspunsul dvs., persoana căreia îi scrieți are acces la toate informațiile pe care le-ați pus la dispoziție utilizatorilor înregistrați în profilul dvs..'
            },
            {
              title: 'Ce se întâmplă când răspund la un anunț?',
              text: 'Persoana care a postat înregistrarea va fi anunțată și va putea citi mesajul dvs. Imediat ce răspunde, veți afla despre ce utilizator este vorba și vă puteți continua conversația cu această persoană în chatul dvs. privat. Cealaltă persoană are și acces la profilul dvs. Presupunem că partea interesată va citi de obicei mesajul dumneavoastră și vă va răspunde într-o perioadă rezonabilă de timp. Dacă nu este cazul, regretăm, dar nu este responsabilitatea noastră.'
            },
            {
              title: 'Ce se întâmplă când cineva răspunde la un anunț pe care l-am postat?',
              text: 'Puteți vizualiza răspunsurile la un anunț în <b>Profilul meu ViMA -> Căutare-Ofertă -> Părți interesate</b>. De îndată ce răspundeți la o solicitare acolo, persoana interesată va fi anunțată și puteți continua conversația în chatul dvs. privat.'
            }
          ]
        },
        {
          title: 'Creare anunț',
          content: [
            {
              title: 'Niciuna dintre categorii nu se potrivește cu anunțul meu - ce ar trebui să fac?',
              text: 'Pentru anunțurile din categoriile <b>Căutare-Ofertă</b> și <b>Grupurile de interese</b>, alegerea a cel puțin unei categorii este obligatorie. Nu vă puteți publica anunțul fără aceste informații. Alegeți categoria care se potrivește cel mai bine cu subiectul dvs..'
            },
            {
              title: 'Ce sunt cuvintele cheie?',
              text: 'Cuvintele cheie definesc conținutul contribuției respective dincolo de categoria selectată. Ele fac mai ușor pentru alți utilizatori să vă găsească postarea. Din motive de claritate, vă recomandăm să nu utilizați mai mult de trei cuvinte cheie.'
            },
            {
              title: 'Ce se întâmplă dacă sugerez un cuvânt cheie?',
              text: 'Dacă încă nu există un cuvânt cheie potrivit pentru subiectul dvs. în lista de selecție, puteți sugera cuvinte cheie noi. Sugestiile dvs. vor fi verificate de administratori și aprobate, dacă este cazul. Dacă este aprobat, puteți adăuga eticheta prin editarea postării respective. Din motive de claritate, vă recomandăm să utilizați nu mai mult de trei cuvinte cheie pentru postările dvs.'
            }
          ]
        },
        {
          title: 'Grupuri de interes',
          content: [
            {
              title: 'Cum pot filtra grupurile de interese în funcție de interesele mele?',
              text: 'Dacă accesați prezentarea generală a grupurilor de interese prin <b>Participați->Grupuri de interese</b>, veți vedea butonul <b>Afișați filtrul</b> în dreapta. Faceți clic pe el și vor apărea diferitele opțiuni de filtrare. Acest lucru vă ajută să găsiți grupurile de interese care vă interesează.'
            },
            {
              title: 'Cum mă alătur unui grup de interese?',
              text: 'Dacă sunteți autentificat, accesați pagina grupului de interese. Un buton <b>Solicitați calitatea de membru</b> va apărea sub numele grupului de interese. Dacă faceți clic pe acesta, va apărea un text. Vă rugăm să vă prezentați și să explicați de ce doriți să vă alăturați acestui grup. Răspunsul dumneavoastră va fi transmis inițiatorului grupului de interese, care acum vă poate accepta sau refuza cererea.'
            },
            {
              title: 'Doresc să mă alătur unui grup de interese, dar lipsește butonul Solicitați calitatea de membru.',
              text: 'Acest lucru înseamnă fie că ați aplicat deja pentru calitatea de membru pentru acest grup de interese. Când se întâmplă acest lucru, lângă numele grupului de interese va apărea simbolul unui oval pentru comentariu. Dacă mișcați mouse-ul acolo, va apărea <b>persoană interesată</b>. Sau cererea ta a fost deja acceptată și sunteți deja membru. Un simbol pentru  <b>Persoane</b> va apărea apoi lângă numele grupului de interese. Dacă mișcați mouse-ul acolo, va apărea <b>Membru</b>. '
            },
            {
              title: 'Cat durează până când cererea mea pentru a deveni membrul unui grup de interese va fi aprobată?',
              text: 'Aceasta depinde de cât de repede poate reacționa inițiatorul <b>Grupului de interese</b> respectiv și, prin urmare, diferă de la grup la grup. Inițiatorii grupului încearcă de obicei să reacționeze cât mai repede posibil.'
            },
            {
              title: 'Cum încep un grup de interese??',
              text: 'Dacă sunteți autentificat, puteți accesa pagina de prezentare generală prin <b>Participă -> Grupuri de interese</b>. În dreapta sus, veți vedea butonul Nou grup de interese. Vă rugăm să alegeți un nume cât mai descriptiv pentru grupul dvs. și să explicați cât mai detaliat posibil în secțiunea <b>Descriere</b> de mai jos care este specificul grupului și ce fel de membri căutați. Vă rugăm să rețineți că fiecare <b>grup de interese</b> trebuie mai întâi să fie aprobat de un administrator. Odată ce grupul pe care l-ați solicitat a fost aprobat, veți primi o notificare că grupul dvs. este acum activ. În calitate de inițiator al unui <b>grup de interese</b>, vă asigurați că membrii respectă regulile noastre. Pentru sprijin puteți numi și alți membri ca moderatori.'
            },
            {
              title: 'De ce nu pot vedea grupul meu de interese imediat după ce l-am creat?',
              text: 'Fiecare grup de interese trebuie mai întâi să fie aprobat de un administrator.'
            },
            {
              title: 'Cât timp va dura până când grupul meu de interese va fi aprobat?',
              text: 'Încercăm să aprobăm solicitarea dvs. cât mai repede posibil, acest lucru ar trebui să se întâmple de obicei în 24 de ore. Vă rog să înțelegeți, mai ales în weekend că poate dura mai mult.'
            },
            {
              title: 'Cum pot invita oameni în grupul meu?',
              text: 'Dacă sunteți autentificat, vă puteți vedea grupurile în <b>Deschideți profilul meu ViMA -> Grupurile mele de interese</b>. Dacă sunteți inițiatorul sau moderatorul unui grup, puteți invita alți utilizatori înregistrați în grup folosind butonul din coloana <b>Membri</b>. De asemenea, puteți vedea cine este deja membru al grupului dvs., pe cine ați invitat deja și dacă există solicitări de membru în așteptare.'
            },
            {
              title: 'Cum pot edita sau șterge o postare deja creată?',
              text: 'Va rugam sa va logați. Sub <b>Deschide profilul meu ViMA -> Subiectele mele de discuție</b> puteți să vă vedeți postările și să le editați prin Editare sau Ștergere. Acest lucru se aplică tuturor postărilor pe care le-ați făcut în <b>forumul de discuții</b> sau într-un <b>grup de interese</b>. Dacă sunteți inițiatorul unui grup de interese, puteți modifica "textul" despre grupul dvs. de interese accesând <b>Deschideți ViMA -> Grupurile mele de interese</b> pentru a găsi grupul de interese respectiv și apoi faceți clic pe butonul <b> Editați</b>. Vă rugăm să rețineți că modificările în acest domeniu trebuie mai întâi aprobate de administratori.'
            },
            {
              title: 'Was ist die Aufgabe von Moderator*innen in den Interessengruppen?',
              text: 'Als Moderator*in unterstützen Sie den/die Initiator*in der Gruppe. Sie können auch Mitglieder zur Gruppe einladen. Sie können Impulse geben, um andere Mitglieder zum aktiven Mitmachen anzuregen. Uns ist es wichtig, dass jegliche Kommunikation auf der Plattform angemessen und respektvoll verläuft. Als Moderator*in achten Sie hierauf und lassen uns wissen, wenn Nutzer*innen gegen die Regeln verstoßen. Unsere Regeln finden Sie in den <b>Kommunikationsregeln</b>. Mitglieder Ihrer Gruppe können Beiträge bei Ihnen melden und müssen dabei begründen, warum der Beitrag gegen die Regel verstößt. Als Moderator*in und Initiator*in erhalten Sie dann eine Benachrichtigung, die Sie in <b>Meine Interessengruppen</b> unter Verstöße einsehen können. Sie können den entsprechenden Beitrag dann auch löschen. Wenn Sie hierzu Fragen haben und sich unsicher sind, wenden Sie sich gerne an uns unter vima@ileu.net.'
            },
            {
              title: 'Cum desemnez un moderator pentru grupul meu de interese?',
              text: 'Dacă sunteți autentificat, vă puteți vedea grupurile sub <b>Deschideți profilul meu ViMA -> Grupurile mele de interese</b>. Dacă sunteți inițiatorul unui grup, puteți utiliza acum butonul din coloana <b>Moderatori</b> pentru a numi un membru al grupului ca moderator.'
            },
            {
              title: 'Cum pot deveni moderator al unui grup de interese??',
              text: 'Doar inițiatorul grupului respectiv vă poate numi moderator. Dacă sunteți interesat de această sarcină, contactați direct inițiatorul, de exemplu prin chat.'
            }
          ]
        },
        {
          title: 'Forum de discuții',
          content: [
            {
              title: 'De ce nu pot începe o discuție pe forumul de discuții?',
              text: 'Forumul de discuții este încă în faza de testare momentan. Prin urmare, discuțiile nu pot fi încă create de utilizatori. Cu toate acestea, puteți participa la discuțiile existente dacă sunteți înregistrat.'
            },
            {
              title: 'Cum pot edita sau șterge o postare deja creată?',
              text: "Va rugam sa va logati. Sub <b>Deschide profilul meu ViMA -> Subiectele mele de discuție</b> puteți să vă vedeți postările și să le edita'i folosind butoanele <b>Editare</b> sau <b>Șterge</b>. Acest lucru se aplică postărilor pe care le-ați făcut în forumul de discuții sau într-un grup de interese."
            },
            {
              title: 'Ce înseamnă asteriscul de lângă titlurile discuției?',
              text: 'Dacă dați clic pe asterisc, vă abonați la acest subiect și veți fi informat când sunt afișate noi postări. Acest lucru este valabil pentru firele de discuții din cadrul unui grup de interese, precum și în forumul de discuții. Trebuie să fiți autentificat pentru a utiliza această opțiune.'
            }
          ]
        },
        {
          title: 'Evenimente',
          content: [
            {
              title: 'Ce fel de evenimente vor fi afișate?',
              text: 'Postăm în primul rând evenimente relevante în Ulm și în împrejurimi. Pe viitor, partenerii noștri de cooperare își pot publica evenimentele aici.'
            },
            {
              title: 'Pot solicita administratorilor să înregistreze un eveniment??',
              text: 'Suntem bucuroși să acceptăm sugestii pentru evenimente relevante în Ulm și în împrejurimi. Dacă faceți parte din organizația care găzduiește evenimentul, contactați-ne la vima@ileu.net.'
            },
            {
              title: 'Pot posta singur un eveniment??',
              text: 'Momentan, evenimentele pot fi create doar prin intermediul nostru. Suntem bucuroși să acceptăm sugestii pentru evenimente relevante din Ulm și împrejurimi (vima@ileu.net).'
            }
          ]
        },
        {
          title: 'Partener de cooperare',
          content: [
            {
              title: 'Această categorie este în prezent în construcție',
              text: ''
            }
          ]
        },
        {
          title: 'Newsletter',
          content: [
            {
              title: 'Cum mă pot înregistra pentru newsletter?',
              text: 'Faceți clic pe Abonare la Newsletter în partea de jos a site-ului. Ca utilizator înregistrat, vă puteți gestiona abonamentul la newsletter în <b>Deschide profilul meu ViMA -> Setările mele</b>.'
            },
            {
              title: 'Cine este responsabil pentru platforma ViMA?',
              text: 'ViMA (Virtual.Mitmachen.Aktiv! in Ulm) este operat de ILEU e.V. (Institutul de învățare virtuală și reală în educația adulților de la Universitatea din Ulm e.V.) și este finanțat ca parte a proiectului "Ulm4CleverCity - Smart City Model City" de către departamentul Agenda digitală din orașul Ulm.'
            }
          ]
        },
        {
          title: 'Raportați utilizatori/postări',
          content: [
            {
              title: 'Ce se întâmplă dacă blochez un utilizator?',
              text: 'Puteți bloca și debloca utilizatorii în chat (<b>Deschide profil meu ViMA -> Chats</b>). Utilizatorii blocați nu vă mai pot trimite mesaje prin chat. Aici puteți vedea și dacă alt utilizator v-a blocat. Dacă doriți să raportați un utilizator, utilizați funcția de raportare (trei puncte) de sub mesajul relevant de postare/chat al utilizatorului.'
            },
            {
              title: 'Cum pot raporta un utilizator persoanei responsabile pentru ViMA?',
              text: 'Puteți raporta postările utilizatorilor folosind cele trei puncte de sub postarea în cauză. Vă rugăm să furnizați motivul raportului dvs. în caseta care apare când faceți clic pe <b>Raportați</b>. Mesajul dumneavoastră va fi transmis administratorilor noștri care vor răspunde cât mai curând posibil. Raportările privind încălcările în cadrul grupurilor de interese sunt transmise inițiatorilor și moderatorilor grupului de interese.'
            },
            {
              title: 'Cum pot raporta o postare?',
              text: 'Puteți raporta postările care încalcă regulile noastre de comunicare folosind butonul cu trei puncte care apare sub fiecare postare. Când faceți clic pe <b>Raportați</b>, va apărea o casetă "text".  Vă rugăm să furnizați un scurt motiv pentru care raportați postarea. Raportarea va fi trimisă direct administratorilor noștri, care vor răspunde cât mai curând posibil. Raportările privind încălcările în cadrul grupurilor de interese sunt transmise inițiatorilor și moderatorilor grupului de interese.'
            }
          ]
        },
        {
          title: 'Diverse',
          content: [
            {
              title: 'General',
              text: 'Dacă întâmpinați probleme la încărcarea site-ului sau la vizualizarea unor postări noi, vă recomandăm să reîmprospătați site-ul de câteva ori (reîmprospătare sau combinația de taste Ctrl și R).'
            }
          ]
        }
      ],
      ua: [
        {
          title: 'Профіль',
          content: [
            {
              title: 'Навіщо мені створювати профіль?',
              text: "Усі особи, які хочуть активно приймати участь у житті ViMA із адміністративних міркувань мають створити профіль. Електронна адреса є доступною тільки для адміністраторів. Нік, Фото та Про мене є доступними тільки для зареєстрованих користувачів. Вік, Стать чи Місце проживання із статистичних міркувань є обов'язковими відомостями. Ви можете в <b>Мої налаштування</b> встановити: хто може бачити ці дані."
            },
            {
              title: 'Що я можу робити після створення профілю?',
              text: 'Щоб приймати активну участь у житті ViMA Вам потрібен профіль Після цього Ви зможете створювати Оголошення Пошук-Пропозиція чи відповідати на вже існуючі оголошення. Ви можете вступати у групи за інтересами чи такі засновувати. Ви можете брати участь у дискусійних форумах. Ви можете приймати участь у групах чи створювати їх. Ви можете також приймати участь у форумах.'
            },
            {
              title: 'Хто може відвідувати мою сторінку?',
              text: 'Тільки зареєстровані користувачі можуть бачити Вашу сторінку та заходити на неї. Окрім того в <b>Моя ViMA відкрити -> Мої налаштування</b> Ви можете встановити: чи можуть зареєстровані користувачі переглядати таку інформацію як вік, стать або місце проживання чи тільки адміністратори.'
            },
            {
              title: 'Що таке нік?',
              text: "Після того, як Ви успішно створили профіль, - Ви мусите обрати нік. Ви самостійно визначаєте: під яким іменем Вас можуть бачити інші. Це може бути як Ваше справжнє ім'я, так і вигадане. Ваш нік будуть бачити як зареєстровані користувачі, так і відвідувачі сайту. Ваші дописи у відкритих групах та на форумах будуть доступні під Вашим ніком. Також у системі пошуку Ви будете з'являтися під своїм ніком. Ваші оголошення Пошук-Пропозиція  будуть опубліковані анонімно."
            },
            {
              title: 'Яку інформацію мого профілю можуть бачити інші?',
              text: 'Це на Ваш розсуд. Поділіться інформацією щодо Ваших уподобань та професійного розвитку, але зважайте: цю інформацію зможуть бачити зареєстровані користувачі.'
            },
            {
              title: 'Як змінити дані мого профілю?',
              text: 'Щоб змінити дані Вашого профілю, - Ви мусите авторизуватися. У <b>Моя ViMA відкрити</b> Ви можете в <b>Мій профіль-дані</b> змінити Ваші дані. Зрештою Ви мусите підтвердити Ваші зміни, натиснувши на <b>Дані зберегти</b> – внизу сторінки – зберегти.'
            },
            {
              title: 'Як я можу видалити профіль?',
              text: 'Ви можете у будь-який час видалити профіль. Після того, як Ви авторизувалися, перейдіть на <b>Моя ViMA відкрити-> Мій профіль-дані</b>, внизу сторінки натисніть на <b>Профіль остаточно видалити</b>.'
            },
            {
              title: 'Що трапиться із моїми дописами після того, як я видалю профіль?',
              text: "Після того, як Ви видалите профіль, - Ваші оголошення в  <b>Пошук-Пропозиція</b> будуть також видалені. Ваші дописи в групах та на форумах будуть і надалі доступними, однак анонімно і без прив'язки до Вашого ніку. Якщо Ви хочете, щоб Ваші дописи були також видалені, - Ви мусите зробити це перш, ніж Ви видалите профіль."
            },
            {
              title: 'Чи може мій профіль видалити хтось інший?',
              text: 'Ваш профіль може бути видалено тільки Вами або адміністраторами.'
            },
            {
              title: 'Я не проживаю в Ульмі. Чи можу я все одно зареєструватися?',
              text: "Звичайно! Кожен може співпрацювати з ViMA aktiv mitmachen, хто має ідеї для ViMA, адже ViMA кожному пропонує можливість для віртуального об'єднання та обміну уподобаннями."
            },
            {
              title: 'Яка інформація відноситься до розділу Про мене?',
              text: "Це на Ваш розсуд. Поділіться таким обсягом інформацію про Ваші уподобання та професійний розвиток, скільки забажаєте, але пам'ятайте, що цю інформацію зможуть бачити зареєстровані користувачі."
            },
            {
              title: 'Чи мушу я завантажити світлину до мого профілю?',
              text: 'Завантаження світлини профілю є Вашою особистою справою, однак світлина профілю полегшує ідентифікацію користувача. Ви можете використати як Ваше особисте фото, так і фото яке характеризує Вас. Використовуйте світлини, на які Ви володієте правами.'
            },
            {
              title: 'Що означає авторське фото, коли Ви завантажуєте світлину?',
              text: "У Вашому профілі та Ваших дописах Ви маєте право використовувати тільки ті світлини, на які маєте авторські права. Уведіть у це поле своє ім'я, якщо Ви маєте авторські права на на світлину, чи вкажіть особу, яка дала Вам дозвіл використовувати це фото. Зважайте нате, що це правило діє як для світлини Вашого профілю, так і на світлини в <b>Пошук-Пропозиція</b> Оголошення чи Групи."
            }
          ]
        },
        {
          title: 'Моя ViMA',
          content: [
            {
              title: 'Що означає Моя ViMA відкрити?',
              text: 'Після того, як Ви авторизувалися, Ви маєте в <b>Моя ViMA відкрити</b> доступ до Вашого персонального розділу ViMA: Тут Ви знайдете дані Вашого профілю і отримаєте доступ до Ваших оголошень та дописів у групах та на форумах. У <b>Член знайти</b> Ви можете знайти інших учасників і через функцію чату написати їм. У <b>Мої налаштування</b> Ви можете вирішити: у яких випадках Ви хочете отримувати сповіщення у світлі Вашої активності на сайті на електронну пошту та які відомості і хто може бачити. У <b>Мій профіль-дані -> Профіль редагувати</b> Ви можете змінити дані свого профілю können. Якщо Ви хочете видалити свій профіль - натисніть внизу, з лівого боку цієї сторінки на <b>Профіль остаточно видалити</b>. Будь ласка, не забувайте при кожній зміні на <b>Дані зберегти</b> натиснути.'
            },
            {
              title: 'Де я можу побачити свої оголошення Пошук-Пропозиція?',
              text: "Як тільки Ви авторизуєтеся - можете бачити Ваші оголошення в <b>Моя ViMA</b> відкрити, натиснувши на <b>Мій Пошук/Пропозиція</b>. Тут Ви також можете редагувати своє оголошення чи видалити його. У <b>Зацікавлена особа/и</b> Ви можете бачити, хто відповів на Ваше оголошення. Тут Ви також можете бачити всі оголошення, на які Ви відповіли. Ви побачите це, коли в графі <b>Взаємозв'язок Зацікавлена особа/и</b> стоїть. У Вашому оголошенні <b>Взаємозв'язок Ініціатор/ка</b>знаходиться внизу."
            },
            {
              title: 'Коли я отримую повідомлення на електрону пошту від ViMA?',
              text: 'Як тільки Ви авторизувалися - встановіть у <b>Моя ViMA відкрити -> Мої налаштування</b> чи хочете Ви отримувати повідомлення на електронну пошту та у яких випадках, наприклад, якщо Ви отримали на <b>Пошук-Пропозиція</b> відповідь на Ваше оголошення чи у чаті є нове повідомлення для Вас. Якщо Ви не бажаєте отримувати сповіщень - Ви можете також тут відмовитися від цієї опції. Ми просимо Вам регулярно авторизовуватися і перевіряти: чи отримали Ви якісь повідомлення з тим, аби вони не залишилися без відповідей.'
            },
            {
              title: 'Чи мушу я щоразу виходити, а потім знову авторизовуватися?',
              text: 'Це Ваше рішення. Якщо цей пристрій, із якого Ви, зазвичай, авторизовуєтеся, використовується іншими особами, - ми радимо Вам щоразу виходити з тим, щоб ніхто не міг отримати доступу до Вашого профілю. У противному випадку Ви можете завжди залишатися авторизованим/ю, тому що Ви відразу можете на свою <b>Моя ViMA відкрити</b> зайти.'
            },
            {
              title: 'Як я можу дізнатися про нові сповіщення?',
              text: "Якщо Ви маєте нові сповіщення, то біля <b>Моя ViMA відкрити</b>з'явиться знак оклику. Якщо Ви випадаюче меню (Drop Down Menu, з англійської to drop down‚ \"випадати\") відкриєте - Ви побачите ще оидн знак оклику поряд із розділом, де є нові сповіщення для Вас. Окрім того за бажанням Ви можете отримувати сповіщення на електронну пошту. Для цього Ви мусите після успішної авторизації у <b>Моя ViMA відкрити -> Мої налаштування</b> одноразово встановити: чи хочете Ви отримувати сповіщення на електронну пошту і у яких випадках, наприклад якщо відповіді на Ваших <b>Пошук-Пропозиція</b> Оголошення отримали, чи маєте нове повідомлення у чаті. Ви можете у будь-який час змінити у налаштуваннях, якщо Ви більше не хочете отримувати повідомлень на електронну пошту."
            },
            {
              title: 'Я забув/ла пароль. Що робити?',
              text: 'У <b>Авторизуватися</b> Ви отримаєте можливість встановити новий пароль. Натисніть на стрілку біля <b>Забули свій пароль?</b>. Після цього введіть електронну адресу, через яку Ви зареєструвалися на цьому сайті, і невдовзі Ви отримаєте на неї посилання, перейшовши за яким, Ви можете встановити новий пароль.'
            },
            {
              title: 'Як функціонує розділ Мої чати?',
              text: "Чат має дві функції: по-перше він є формою комунікації для оголошень Пошук-Пропозиція. Як тільки обидві сторони - особа, що створила оголошення, та зацікавлена особа/и - почали комунікацію, - всі повідомлення надалі з'являтимуться в чаті. Доки комунікаця залишається без відповіді - Ви можете бачити повідомлення в Пошук-Пропозиція. Окрім того Ви можете використовувати чат через профіль зараєстрованих користувачів і напряму писати користувачам, із якими Ви познайомилися у групах.<br>Пам'ятайте, будь ласка, що платформа ViMA не є сайтом знайомств!"
            }
          ]
        },
        {
          title: 'Пошук-Пропозиція',
          content: [
            {
              title: 'Як створити оголошення Пошук-Пропозиція?',
              text: 'після того, як Ви авторизувалися, перейдіть на сторінку <b>Пошук-Пропозиція</b>, наприклад, через Drop Down меню <b>Співпрацювати</b>. Тоді Ви побачите зверху, справа клавішу  <b>Нове оголошення +</b>.'
            },
            {
              title: 'Як сформулювати оголошення Пошук-Пропозиція?',
              text: "При формулюванні Вашого оголошення <b>Пошук-Пропозиція</b> будьте максимально конкретним/ю. Спробуйте уявити: хто є тією/тими зацікавленою/ними особою/бами, яка/і має/ють з Вами зв'язатися. Чим точнішими Ви є, тим більшою є вірогідність, що з Вами зв'яжуться ті особи, яких Ви потребуєте. Зважте на те, що Ваше оголошення буде опубліковано анонімно. Відтак інші користувачі можуть прочитати зміст оголошення, але не дізнаються імені його автора."
            },
            {
              title: 'Чому мого оголошення Пошук-Пропозиція немає на сайті?',
              text: 'Кожне <b>Пошук-Пропозиція</b> оголошення спочатку буде перевірене адміністраторами і схвалене ними. Ми хочемо переконатися, що оголошення відповідають правилам нашої платформи і не порушують їх. Ми спробуємо реагувати не пізніше, як за 24 години.'
            },
            {
              title: 'Скільки потрібно часу, щоб моє оголошення було схвалено?',
              text: 'Наші адміністратори спробують відреагувати не пізніше, як за 24 години. Як цей процес триватиме довше, особливо - під час вихідних, - ми просимо Вас про розуміння. Ви отримаєте повідомлення електронною поштою, як тільки оголошення буде схвалено.'
            },
            {
              title: 'Я знайшов/ла цікаве оголошення. Що тепер робити?',
              text: 'Під оголошенням є  "текст"скринька для вашого повідомлення. Будьте також максимально конкретним/ою: наприклад, чому Ви цікавитеся цим оголошенням, хто Ви є, що Вас мотивувало, чи маєте якусь пропозицію? Зважте на те, що особа, якій Ви пишете, разом з Вашою відповіддю отримає доступ до всієї інформації, відображеної у Вашому профілі для зареєстрованих користувачів.'
            },
            {
              title: 'Що трапиться після того, як я відповім на оголошення?',

              text: 'Особа, що створила оголошення, буде сповіщена і зможе прочитати відповідь. Як тільки Ви відповісте: Ви дізнаєтеся - ким є цей користувач/ка і Ви можете продовжити Вашу комунікацію у приватному чаті. Ця особа також отримає доступ до Вашого профілю. Як правило, зацікавлена особа/и регулярно перечитує повідомлення і відповідає на них. Якщо цього не трапляється - нам дуже жаль, але це знаходиться за межами нашої відповідальності.'

            },
            {
              title: 'Що трапиться після того, як хтось відповість на моє оголошення?',
              text: 'Відповіді на оголошення Ви можете в <b>Моя ViMA -> Пошук-Пропозиція -> Зацікавлена особа/и</b> побачити. Як тільки Ви відповісте на запит. - зацікавлена особа буде повідомлена про це і Ви зможете продовжити комунікацію у приватному чаті.'
            }
          ]
        },
        {
          title: 'Дописи створити',
          content: [
            {
              title: 'Мені не підходить жодна категорія. Що робити?',
              text: "Для <b>Пошук-Пропозиція</b> оголошень, а також  <b>Зацікавлена особа/и</b> вибір принаймні однієї категорії є обов'язковим. Без цієї інформації Ви не зможете опублікувати допис. Виберіть категорію, яка найбільше відповідає Вашій темі."
            },
            {
              title: 'Що таке теги?',
              text: 'Теги вказують на зміст кожного допису вибраної категорї. Ви спрощують пошук для інших користувачів. Ми рекомендуємо Вам все-таки використовувати не більше трьох тег.'
            },
            {
              title: 'Що трапиться після того, як запропоную теги?',
              text: 'Якщо до Вашої теми не підходить жодна тега із запропонованого переліку - Ви можете запропонувати нову тегу. Адміністратори перевірять Ваші пропозиції і, якщо все гаразд, схвалять їх. Після того, як тега буде схвалена, - Ви можете додати її до допису. Ми рекомендуємо Вам все-таки використовувати не більше трьох тег.'
            }
          ]
        },
        {
          title: 'Групи',
          content: [
            {
              title: 'Як я можу відфільтрувати групи за моїми інтересами?',
              text: "Якщо Ви через <b>Співпрацювати-> Групи</b> на  Перегляд груп перейдете - Ви побачите нагорі клавішу  <b>Фільтр показати</b>. Після того, як Ви натиснете на неї, - з'являться різні можливості фільтрування. Так Ви можете швидше знайти групи, які максимально відповідають Вашим інтересам."
            },
            {
              title: 'Як я можу стати учасником тієї чи іншої групи?',
              text: "Після того, як Ви авторизувалися, - перейдіть до категорії групи. Під назвою групи Ви побачите клавішу <b>Стати учасником</b>. Як тільки Ви натиснете сюди - з'явиться  \"текст\"скринька. Будь ласка, представтеся коротко і поясніть: чому Ви хочете стати учасником цієї групи. Ваша відповідь буде надіслана авторові/ці групи , який/а Вашу заявку прийме або відхилить."
            },
            {
              title: 'Я хочу стати учасником групи, але не бачу клавіші подати заявку.',
              text: "Це означає, що Ви вже подали заявку на те, щоб стати учасником цієї групи. У цьому випадку поряд із назвою групи з'явиться хмаринка. Після того, як Ви натиснете на неї , - з'явиться <b>Зацікавлена особа</b>. Або Ваш запит уже прийнятий і Ви вже є учасником групи. Тоді поряд із назвою групи з'явиться <b>Особи-Символ</b>. Коли Ви перейдете туди -  <b>Учасник</b>. "
            },
            {
              title: 'Скільки часу потрібно для відповіді на мій запит стати учасником групи?',
              text: 'Це залежить від того, як швидко автор/ка кожної <b>Група</b> зможе відреагувати і це не є уніфіковано для кожної групи. Зазвичай автори групи є зацикавленими, щоб цей процес завершився якнайшвидше.'
            },
            {
              title: 'Як я можу заснувати групу?',
              text: 'Як тільки Ви авторизувалися - Ви опинитеся через  <b>Співпрацювати -> Групи</b> на сторінці перегляду. Справа зверху Ви побачите клавішу Нові групи.  Виберіть,будь ласка, назву для Вашої нової групи і розкажіть про неї максимально детально в рубриці, яка знаходиться нижче  <b>Опис</b>, про що йдеться і яких учасників Ви шукаєте? Зважте, що кожна  <b>Група</b> спочатку має бути схвалена адміністраторами . Як тільки група  буде схвалена - Ви отримаєте повідомлення, що Ваша група вже є активною. Як автор/ка <b>Група</b> переконайтеся, що всі учасники дотримуються наших правил. Ви можете також додати інших модераторів.'
            },
            {
              title: 'Чому я не можу бачити свою групу відразу після створення?',
              text: 'Кожна новостворена група має бути спочатку схвалена адміністраторами.'
            },
            {
              title: 'Скільки часу потрібно, щоб схвалити нову групу?',
              text: 'Ми спробуємо Вашу заявку схвалити якомога швидше, зазвичай це триває не довше, ніж 24 години. Будь ласка, поставтеся з розумінням особливо під час вихідних, що це може тривати довше.'
            },
            {
              title: 'Як я можу запросити осіб в мою групу?',

              text: 'Як тільки Ви авторизувалися - Ви побачите в <b>Моя ViMA відкрити -> Мої групи</b> Ваші групи. Якщо Ви є адміністратором чи модератором групи - ннатиснувши на клавішу в графі   <b>Учасники</b> інших зареєстрованих користувачів запросити. Також Ви можете там побачити - хто є учасниками вашої групи, кого Ви запросили стати учасником і відкриті запити на членство в групі.'
            },
            {
              title: 'Як я можу редагувати вже існуючий допис чи видалити його?',
              text: "Авторизуйтеся. У <b>Моя ViMA відкрити -> Мої дискусійні теми</b> Ви можете бачиити Ваші дописи і через функції редагувати або видалити режисувати це.  Це стосується всіх дописів, які Ви на <b>Форуми/b> чи в <b>Група</b> поширили. Якщо Ви є автором групи - Ви можете \"текст\" в Ваша група змінити, натиснувши на <b>Моя ViMA відкрити -> Мої групи</b> знайти конкретну групу, а потім на <b>Редагувати</b> натиснути. Пам'ятайте, що в цьому розділі всі зміні мусять буті спочатку схвалені адміністраторами."
            },
            {
              title: 'Які функції мають модератори групи?',
              text: 'Модератори допомагають авторам групи. Також вони можуть запрошувати нових учасників групи. Вони покликані також мотивувати учасників до активної діяльності в групі. Нам важливо, щоб комунікування на нашій платформі відбувалося у ввічливій формі. Модератори також слідкують за тим, щоб користувачі не порушували наші правила. Наші правила Ви знайдете в  <b>Правила комунікації</b>. Учасники групи можуть Вам поскаржитися на інших осіб, які порушують правила, обґрунтувавши такий крок. Модератори та автори отримають повідомлення, які вони в  <b>Мої групи</b> в Порушеннях побачити можуть. Вони можуть також видалити певний допис. Якщо у Вас виникли у цьому контексті запитання - зверніться, будь ласка, до нас за наступною електронною адресою wenden vima@ileu.net.'
            },
            {
              title: 'Яким чином я призначаю модераторів групи?',
              text: 'Після того, як Ви авторизувалися - побачите в  <b>Моя ViMA відкрити -> Мої групи</b> Ваші групи. Якщо Ви є автором групи - натисніть на клавішу у графі <b>Модератор/ка</b> Учасник групи  Модератор/ка призначити.'
            },
            {
              title: 'Як я можу стати модератором групи?',
              text: 'Тільки автор групи може призначити вас модератором/кою. Якщо вас це це цікавить - зверніться до автора цієїгрупи, наприклада, через чат.'
            }
          ]
        },
        {
          title: 'Дискусійний форум',
          content: [
            {
              title: 'Чому я не можу розпочати дискусію на форумі?',
              text: 'Наразі форум  функціонує у тестовому режимі. Тому користувачі поки що не можуть розпочати нових дискусій. Ви можете прийняти участь у вже існуючих дискусіях за умови, що Ви є зареєстрованим користувачем.'
            },
            {
              title: 'Як я можу редагувати вже існуючий допис чи видалити його?',
              text: 'Авторизуйтесяю У <b>Моя ViMA відкрити -> Мої дискусійні теми</b> Ви можете бачити свої дописи і за допомогою клавіші <b>Редагувати</b> або <b>Видалити</b> редагувати. Це стосується дописів, які Ви поширили на форумах чи в групах.'
            },
            {
              title: 'Що означає зірочка біля назви дискусії?',
              text: 'Якшо Ви натиснете на зірочку - Ви абонуєте цю дискусію і будете проінформовані про нові дописи у її рамках. Це стосується дискусій як у групах, так і на форумах. Для цього Вам потрібно авторизуватися.'
            }
          ]
        },
        {
          title: 'Міроприємства',
          content: [
            {
              title: 'Які міроприємства будуть поширені?',
              text: 'Ми поширюємо, зазвичай, найважливіші міроприємства в Ульмі та околицях. У майбутньому наші партнери зможуть також поширювати тут певні міроприємства.'
            },
            {
              title: 'Чи можу я попросити адмімістраторів про поширення міроприємства?',
              text: 'Ми із задоволенням приймемо ваші пропозиції щодо важливих міроприємств в Ульмі та околицях. Якщо Ви є членом певної організації - сконтактуйтеся з нами через електронну пошту: vima@ileu.net.'
            },
            {
              title: 'Чи можу я особисто поширити якесь міроприємство?',
              text: 'Наразі тільки ми можемо поширювати міроприємства. Ми приймемо із задовелленям  Ваші пропозицції щодо нових міроприємств (vima@ileu.net).'
            }
          ]
        },
        {
          title: 'Партнери',
          content: [
            {
              title: 'Цей розділ знаходиться на стадії розробки',
              text: ''
            }
          ]
        },
        {
          title: 'Розсилка',
          content: [
            {
              title: 'Як я можу замовити розсилку?',
              text: 'Натисніть унизу на сайті на абонувати розсилку. У якості зареєстрованого користувача Ви можете Ваш абонемент на розсилку в <b>Моя ViMA відкрити -> Мої налаштування</b> управляти.'

            },
            {
              title: 'Хто є відповідальним за платформу ViMA?',
              text: 'ViMA (Віртуально.Співпрацювати.Активно! в Ульмі) управляється та просувається ILEU e.V. (Інститут віртуального та реального навчання в рамках освіти для дорослих в Ульмівському університеті) в рамках проєкту „Ульм4РозумнеМісто – Розумне Місто Місто-модель“ офісом Віртуальної повістки дня міста Ульм.'
            }
          ]
        },
        {
          title: 'Користувач / Дописи поскаржитися',
          content: [
            {
              title: 'Що трапиться, якщо я заблокую певного користувача?',
              text: 'Ви можете заблокувати певного користувача у чаті, а також розблокувати його (<b>Моя ViMA відкрити -> Мої чати</b>). Заблоковані користувачі більше не зможуть надсилати Вам повідомлення у чаті. Тут Ви можете побачити: чи якийсь користувач заблокував Вас. Якщо Ви хочете поскаржитися на певного користувача - використайте фунцію скарги  (три крапки) під конкретним дописом/ повідомленням у чаті певного користувача'
            },
            {
              title: 'Як я можу поскаржитися на певного користувача відповідальній особі з ViMA?',
              text: "Ви можете поскаржитися на допис певного користувача, використавши три крапки під цим дописом. Будь ласка, вкажіть причину Вашої скарги у вікні, яке з'явиться, якщо Ви на <b>Поскаржитися</b> натиснете. Ваше повідомлення буде надіслано нашим адміністраторам, які якомога швидше відреагують на нього. Скарги про порушення в групах будуть надіслані безпосередньо авторам чи модераторам цієї групи."
            },
            {
              title: 'Як я можу поскаржитися на допис?',
              text: "На дописи, які суперечать нашим внутрішнім правилам, Ви можете поскаржитися, використавши для цього три крапки під кожним дописом. Якщо Ви на <b>Поскаржитися</b> натиснете, то з'виться \"текст\"вікно. Будь ласка, коротко обґрунтуйте тут: чому Ви хочете поскаржитися на цей допис. Ваша скарга буде надіслана адміністраторам, які якомога швидше відреагують на неї. Скарги про порушення в групах будуть надіслані безпосередньо авторам чи модераторам цієї групи."
            }
          ]
        },
        {
          title: 'Інше',
          content: [
            {
              title: 'Загальне',
              text: 'Якщо у Вас виникнуть проблеми при завантаженні цього сайту або ви не бачите дописів - ми рекомендуємо Вам перезавантажити сайт (Обновити або комбінация клавіш Strg та R).'
            }
          ]
        }
      ],
      bg: [
        {
          title: 'Профил',
          content: [
            {
              title: 'Защо трябва да създам профил?',
              text: 'По административни причини всеки, който иска да бъде активен във ViMA, трябва да създаде профил. Имейл адресът е видим и достъпен само за администратора. Потребителско име, снимка и информация за мен са по избор и се виждат от всички регистрирани потребители. Възраст, пол и местоживеене са задължителни за статистически цели.'
            },
            {
              title: 'Какво мога да направя, след като създам профил?',
              text: 'За да участвате активно във ViMA, ви е необходим профил. Това ви позволява да създавате обяви за търсене/предлагане или да отговаряте на вече съществуващи обяви. Можете да се присъедините и да създавате групи по интереси. И може да участвате в дискусионни форуми.'
            },
            {
              title: 'Кой може да посети моя профил?',
              text: 'Само регистрирани потребители могат да посещават и разглеждат вашия профил. Можете също така да посочите дали вашата възраст, пол и местоживеене трябва да се виждат от други регистрирани потребители или само за администратори в <b>Отвори Моята ViMA -> Моите настройки</b>.'
            },
            {
              title: 'Какво е потребителско име?',
              text: 'Когато създавате своя профил, трябва да изберете потребителско име. Може да решите кое име искате да използвате, за да бъде видимо за другите. Това може да бъде вашето име или псевдоним по ваш избор. Вашето потребителско име ще бъде видимо за посетители на уебсайта и за регистрирани потребители. Вашите публикации в дискусионния форум, както и в общите групи по интереси ще се появят заедно с вашето потребителско име. Вие също ще се появите в търсенето на членове с вашето потребителско име. Вашите обяви за търсене/предлагане се публикуват анонимно.'
            },
            {
              title: 'Кои подробности от моя профил ще бъдат видими за другите?',
              text: 'Вашето потребителско име, вашата снимка и секцията „За мен“ ще бъдат видими. Искаме подробности като вашата възраст, пол и местоживеене само по статистически причини. Зависи изцяло от вас за кого вашата възраст, пол и място на пребиваване ще бъдат видими: само за администратори или също и за регистрирани потребители.'
            },
            {
              title: 'Как да променя данните на моя профил?',
              text: 'За да промените данните на вашия профил, трябва да сте влезли в платформата. Кликнете върху <b>Отвори моята ViMA</b>, там можете да промените данните на вашия профил в  <b>Данни за моя профил</b>. След това трябва да запазите промените си, като кликнете върху <b>Запазване на данни</b> - в най-долната част на страницата.'
            },
            {
              title: 'Как да изтрия моя профил?',
              text: 'Можете да изтриете профила си по всяко време. Когато сте влезли, отидете на <b>Отвори моята ViMA-> Данни за моя профил</b> и в долната част на страницата кликнете върху <b>Изтриване на профила за постоянно</b>.'
            },
            {
              title: 'Какво се случва с публикациите ми, когато изтрия профила си?',
              text: 'Ако изтриете потребителския си профил, вашите обяви в <b>Търсене / Предлагане</b> също ще бъдат изтрити. Вашите публикации в групите по интереси и дискусионните форуми остават, но анонимно, т.е. без връзка към вашето потребителско име. Ако искате да изтриете и вашите публикации, премахнете ги, преди да изтриете профила си.'
            },
            {
              title: 'Могат ли други да изтрият моя профил?',
              text: 'Вашият профил може да бъде изтрит само от вас или от администраторите на сайта.'
            },
            {
              title: 'Не живея в град Улм, мога ли да се регистрирам?',
              text: 'Разбира се! Всеки, който подкрепя концепцията ViMA, може да се включи активно. ViMA предлага възможност за виртуална мрежа и обмен на идеи по теми от общ интерес.'
            },
            {
              title: 'Каква информация трябва да бъде предоставена в „За мен“?',
              text: 'Това зависи от вас. Споделяйте колкото искате за вашите интереси или произход, но имайте предвид, че всичко, което напишете за себе си, ще бъде видимо за всички регистрирани потребители.'
            },
            {
              title: 'Трябва ли да кача снимка в профила си?',
              text: 'Зависи от вас да качите снимка на потребителския си профил, но снимката улеснява потребителите да ви разпознаят. Можете да използвате ваша снимка или която и да е снимка, която ви идентифицира. Моля, имайте предвид, че трябва да използвате само снимки, за които притежавате авторски права.'
            },
            {
              title: 'Какво означава авторско право, когато кача снимка?',
              text: 'Във вашия профил и публикации трябва да използвате само снимки, за които притежавате авторски права. Така че в това поле, моля, въведете вашето име, ако притежавате авторски права върху снимката, или посочете лицето, с чието съгласие използвате снимката. Моля, имайте предвид, че това важи за снимката на вашия профил, както и за снимките в обявите „Търсене/Предлагане“ или групите по интереси.'
            }
          ]
        },
        {
          title: 'Моята ViMA',
          content: [
            {
              title: 'Какво е Отвори моята ViMA',
              text: 'Ако сте влезли, имате достъп до вашата лична ViMA зона в <b>Отвори моята ViMA</b>: Тук можете да намерите данните за вашия профил и достъп до вашите обяви, както и публикации във вашите групи по интереси и дискусионните форуми. В <b>Намиране на членове</b>, можете да намерите други членове, като потърсите техните потребителски имена и също така можете да им пишете чрез функцията за чат. В <b>Моите настройки</b>, можете да решите кога искате да получавате известия за дейностите си по имейл и кои подробности трябва да са видими и за кого. В <b>Данни за моя профил -> Редактиране на профил</b> можете да промените данните за профила си. Ако искате да изтриете потребителския си профил, кликнете върху <b>Изтриване на профила за постоянно</b> в долния ляв ъгъл на тази страница. Моля, не забравяйте да кликнете върху <b>Запазване на данни</b> след всяка промяна.'
            },
            {
              title: 'Къде виждам моята обява в Търсене/Предлагане',
              text: 'Ако сте влезли в платформата, можете да намерите вашите обяви в <b>Моята ViMA</b> като кликнете върху <b>Моето Търсене / Предлагане</b>. В този преглед можете също да редактирате или изтриете вашата обява. В <b>Заинтересовани лица</b> можете да видите кой е отговорил на вашата обява. Тук можете също да видите всички обяви, на които сте отговорили. Можете да ги видите, когато се покаже колоната <b>Връзка със заинтересована страна</b>. За вашата собствена обява можете да намерите следното в <b>Инициатор на отношения</b>.'
            },
            {
              title: 'Кога ще получавам имейли от ViMA?',
              text: 'Ако сте влезли, можете да конфигурирате дали и кога искате да получавате известия по имейл, напр. когато получите нови отговори на вашата обява в <b>Търсене / Предлагане</b>, или има ново съобщение за вас в чата, в <b>Отвори моята ViMA -> Моите настройки</b>. Ако не желаете това, можете по всяко време да настроите да не получавате известия. В такъв случай ви молим да влизате редовно, за да проверявате дали сте получили съобщения, за да не останат без отговор.'
            },
            {
              title: 'Трябва ли да излизам всеки път и след това да влизам отново?',
              text: 'Това зависи от вас. Ако устройството, което използвате за влизане, се използва и от други, препоръчваме ви да излизате всеки път, така че никой друг да няма неволен достъп до вашия профил. В противен случай, разбира се, е много удобно да останете влезли в системата, защото след това можете веднага да получите достъп до <b>Отвори моята ViMA</b>.'
            },
            {
              title: 'Как да видя дали имам нови съобщения?',
              text: 'Ако има новини за вас, то удивителен знак ще се появи до <b>Отвори моята ViMAb</b>. Ако сега отворите падащото меню, ще видите друг удивителен знак до областта, където има новини за вас. Можете също да получавате известия по имейла, ако желаете. За да направите това, трябва да влезете и да отидете на <b>Отвори моята ViMA -> Моите настройки</b> за да определите кога и дали искате да получавате известия по имейл, напр. ако сте получили нови отговори на вашата обява в  <b>Търсене / Предлагане</b> или ако има ново съобщение в чата. Можете също да промените тази функция по всяко време, ако не искате повече да получавате имейли.'
            },
            {
              title: 'Забравих паролата си, какво мога да направя?',
              text: 'Във <b>Вход</b> можете да намерите опцията за създаване на нова парола. Кликнете върху стрелката до <b>Забравена парола?</b>. След това въведете имейл адреса, който сте използвали за регистрация и ще ви бъде изпратен  линк за създаване на нова парола.'
            },
            {
              title: 'Как работи секцията Моите чатове?',
              text: 'Чатът има две функции: първо, той се използва за комуникация с обявите в Търсене / Предлагане. Веднага след като и двете страни - лицето, създало обявата и заинтересованата страна - започнат да общуват, съобщенията ще бъдат преместени в чата. Когато само една страна е изпратила съобщение, можете да го видите в Търсене / Предлагане. Можете също да използвате функцията за чат на профилите на регистрирани потребители и да пишете, например, директно на потребителите, които сте срещнали в групите по интереси. <b>Моля, имайте предвид, че платформата ViMA не е сайт за запознанства!'
            }
          ]
        },
        {
          title: 'Търсене / Предлагане',
          content: [
            {
              title: 'Как да създам обява в Търсене/Предлагане?',
              text: 'Когато сте влезли в платформата, отидете на страницата <b>Търсене / Предлагане</b>, напр. чрез падащото меню <b>Присъединяване</b>. След това можете да видите бутона <b>Нови обяви +</b> в горния десен ъгъл.'
            },
            {
              title: 'Как да формулирам моята обява в Търсене/Предлагане?',
              text: 'Когато пишете вашите обяви в <b>Търсене / Предлагане</b>, бъдете възможно най-конкретни. Представете си какъв искате да бъде човекът, който трябва да се свърже с вас. Колкото по-конкретни сте, толкова по-вероятно е подходящо заинтересовано лице да се свърже с вас. Моля, имайте предвид, че вашата обява ще бъде публикувана анонимно. Това означава, че другите потребители на ViMA ще могат да прочетат само това, което пишете за себе си в обявата, но не и да разберат вашето потребителско име.'
            },
            {
              title: 'Защо моята обява в Търсене/Предлагане не е на уебсайта?',
              text: 'Всяка обява в <b>Търсене / Предлагане</b> трябва да бъде одобрена от администратор на сайта на ViMA и след това пусната. Това ще гарантира, че обявите отговарят на нашите насоки за платформата. Опитваме се да реагираме в рамките на 24 часа, ако е възможно.'
            },
            {
              title: 'Колко време ще отнеме одобрението на моята обява?',
              text: 'Нашите администратори се опитват да реагират в рамките на 24 часа. Молим за разбиране, ако това трябва да отнеме повече време, особено през уикендите. Ще получите съобщение веднага щом вашата реклама бъде пусната.'
            },
            {
              title: 'Намерих интересна обява, какво да правя сега?',
              text: 'Под обявата можете да намерите "текстово" поле за вашето съобщение. Отново, бъдете възможно най-конкретни: напр. защо се интересувате от тази оферта, кой/ коя сте вие, какво ви е харесало, имате ли предложение? Моля, имайте предвид, че лицето, на което пишете, ще има достъп до цялата информация, която сте споделили с регистрирани потребители във вашия профил.'
            },
            {
              title: 'Какво се случва, когато отговоря на обява?',
              text: 'Човекът, който е публикувал обявата, ще бъде уведомен и може да прочете вашето съобщение. Веднага след като отговори, вие знаете кой е и можете да продължите разговора си с него в личния си чат. Другият човек също има достъп до вашия профил. Предполагаме, че заинтересованата страна обикновено чете вашето съобщение и ви отговаря в разумен срок. Ако не го направи, съжаляваме за това, но това не е в обхвата на нашата отговорност.'
            },
            {
              title: 'Какво се случва, когато някой отговори на една от моите обяви?',
              text: 'Можете да видите отговорите на обява в <b>Моята ViMA -> Търсене / Предлагане -> Заинтересовани лица</b>. Веднага след като отговорите на заявка там, заинтересованото лице ще бъде уведомено и можете да продължите разговора в личния си чат.'
            }
          ]
        },
        {
          title: 'Създаване на публикации',
          content: [
            {
              title: 'Нито една от категориите не отговаря на публикацията ми - какво да правя?',
              text: 'За обяви в <b>Търсене / Предлагане</b>, както и в <b>Групи по интереси</b>, е задължително да изберете поне една категория. Без тази подробност няма да можете да публикувате обявата си. Изберете категорията, която се доближава най-много до вашата тема.'
            },
            {
              title: 'Какво представляват ключовите думи?',
              text: 'Ключовите думи определят съдържанието на публикацията ви освен в избраната категория. Те ще улеснят другите потребители да намерят публикацията ви. Препоръчваме да използвате не повече от три ключови думи, в противен случай може да стане объркващо.'
            },
            {
              title: 'Какво се случва, когато предложа ключова дума?',
              text: 'Ако все още няма подходяща ключова дума за вашата тема в списъка за избор, можете да предложите нови ключови думи. Вашите предложения ще бъдат проверени от администраторите и одобрени, ако са подходящи. Ако бъдат одобрени, можете да добавите ключовите думи, като редактирате съответната публикация. Препоръчваме ви да използвате не повече от три ключови думи за публикациите си, в противен случай може да стане объркващо.'
            }
          ]
        },
        {
          title: 'Групи по интереси',
          content: [
            {
              title: 'Как мога да филтрирам групи по интереси според моите интереси?',
              text: 'Ако отидете на прегледа на групите по интереси чрез <b>Присъединяване-> Групи по интереси</b>, можете да видите бутона <b>Покажи филтър</b> над плочките вдясно. Кликнете върху него и ще се появят различните опции за филтриране. Това ви улеснява при намирането на групите по интереси, които представляват интерес за вас.'
            },
            {
              title: 'Как мога да се присъединя към група по интереси?',
              text: 'Когато сте влезли в платформата, отидете на страницата на групата по интереси. Под името на групата по интереси ще се появи бутон <b>Кандидатстване за членство</b> Когато кликнете върху него, ще се появи поле "текст" Моля, представете се накратко и обяснете защо искате да се присъедините към тази група. Вашият отговор ще бъде препратен на инициатора на групата по интереси, който след това може да приеме или отхвърли вашата заявка.'
            },
            {
              title: 'Искам да се присъединя към група по интереси, но няма бутон Заявка за членство.',
              text: 'Това означава, че или вече сте заявили членство в тази група по интереси. След това ще се появи балонче до името на групата по интереси. Когато задържите курсора на мишката върху него, ще се появи  <b>Заинтересован</b> Или вашата заявка вече е приета и вече сте член. В този случай до името на групата по интереси ще се появи символ <b>Лице</b>. Ако задържите курсора на мишката върху него, ще се появи <b>Член</b>. '
            },
            {
              title: 'Колко време ще отнеме отговора на искането ми за членство в група по интереси?',
              text: 'Това зависи от това колко бързо може да реагира инициаторът на <b>Група по интереси</b> и следователно варира от група до група. Инициаторите на групата обикновено се опитват да реагират възможно най-бързо.'
            },
            {
              title: 'Как да създам група по интереси?',
              text: 'Ако сте влезли, можете да получите достъп до страницата за преглед на <b>Присъединяване -> Групи по интереси</b>. Горе вдясно виждате бутона Нова група по интереси. Моля, изберете описателно име за вашата група и обяснете в секцията <b>Описание</b> по-долу какво ви интересува и какъв тип членове търсите. Моля, имайте предвид, че всяка <b>Група по интереси</b> трябва първо да бъде одобрена от администратор. Веднага след като заявената от вас група бъде одобрена, ще получите известие, че вашата група вече е активна. Като инициатор на <b>Група по интереси</b>, трябва да гарантирате, че членовете спазват нашите правила. Може да назначите други членове като модератори, които да ви подкрепят и помагат.'
            },
            {
              title: 'Защо не мога да видя моята група по интереси веднага след създаването й?',
              text: 'Всяка група по интереси първо трябва да бъде одобрена от администратор.'
            },
            {
              title: 'Колко време ще отнеме, за да бъде одобрена моята група по интереси?',
              text: 'Опитваме се да одобрим вашата заявка възможно най-скоро, обикновено това трябва да стане в рамките на 24 часа. Молим за разбиране, ако това трябва да отнеме повече време, особено през уикендите.'
            },
            {
              title: 'Как мога да поканя хора в моята група?',
              text: 'Когато сте влезли в платформата, можете да видите своите групи в <b>Отвори моята ViMA -> Моите групи пи интереси</b>. Ако сте инициатор или модератор на група, може да поканите други регистрирани потребители във вашата група, като кликнете върху бутона в колоната <b>Членове</b>. Може също да видите кой в момента е член на вашата група, кого вече сте поканили и дали има отворени заявки за членство.'
            },
            {
              title: 'Как мога да променя или изтрия съществуваща публикация?',
              text: 'Влезте в платформата. В <b>Отвори моята ViMA -> Моите дискусионни теми</b> може да видите публикациите си и да ги редактирате чрез Редактиране или Изтриване. Това се отнася за всички записи, които сте публикували в <b>Дискусионен форум</b> или в <b>Група по интереси</b>. Ако сте инициатор на група по интереси, може да промените "текст" на вашата група по интереси, като  кликнете на <b>Отвори моята ViMA -> Моите групи по интереси</b> и после кликнете върху <b>Редактиране</b>. Моля, имайте предвид, че всички промени в тази област трябва първо да бъдат одобрени от администраторите.'
            },
            {
              title: 'Каква е ролята на модераторите в групите по интереси?',
              text: 'Като модератор подкрепяте инициатора на групата. Може също да поканите членове в групата. А също така да насърчите други членове да участват активно. За нас е важно цялата комуникация в платформата да бъде подходяща и уважителна. Като модератор ще трябва да гледате за това и да ни уведомите, ако потребителите нарушават правилата. Можете да намерите нашите правила в <b>Правила за комуникация</b>.'
            },
            {
              title: 'Как да назнача модератор за моята група по интереси?',
              text: 'Ако сте влезли, можете да видите своите групи в <b>Отвори моята ViMA -> Моите групи по интереси</b>. Ако сте инициатор на група, вече можете да назначите член на групата за модератор, като кликнете върху бутона в колоната <b>Модератори</b>.'
            },
            {
              title: 'Как да стана модератор на група по интереси?',
              text: 'Само инициаторът на групата може да ви назначи за модератор. Ако се интересувате да действате като модератор, моля свържете се директно с инициатора, напр. чрез чата.'
            }
          ]
        },
        {
          title: 'Дискусионен форум',
          content: [
            {
              title: 'Защо не мога да започна дискусия в дискусионния форум?',
              text: 'Дискусионният форум в момента все още е в тестова фаза. Следователно дискусиите все още не могат да бъдат създадени от потребителите. Въпреки това, можете да се присъедините към съществуващи дискусии, ако сте регистрирани.'
            },
            {
              title: 'Как мога да променя или изтрия съществуваща публикация?',
              text: 'Моля, първо влезте в платформата. В <b>Отвори моята ViMA -> Моите дискусионни теми</b> можете да видите публикациите си и да ги редактирате с помощта на бутоните <b>Редактиране</b> или <b>Изтриване</b>. Това се отнася за записи, които сте публикували в дискусионния форум или в група по интереси.'
            },
            {
              title: 'Какво означава звездата до заглавието на дискусиите?',
              text: 'Ако кликнете върху звездата, вие се абонирате за тази дискусионна тема и ще бъдете информирани веднага щом бъдат публикувани нови обяви. Това важи за дискусионни форуми в рамките на група по интереси, както и в дискусионния форум. Трябва да сте влезли в платформата, за да използвате тази опция.'
            }
          ]
        },
        {
          title: 'Събития',
          content: [
            {
              title: 'Какъв тип събития ще бъдат публикувани?',
              text: 'Основно публикуваме важни събития в град Улм и околностите. В бъдеще нашите партньори за сътрудничество също ще могат да публикуват свои собствени събития тук.'
            },
            {
              title: 'Мога ли да помоля администраторите да включат събитие?',
              text: 'Ще се радваме да получим предложения за важни събития в град Улм и околностите. Ако сте част от организацията домакин на събитието, моля свържете се с нас на vima@ileu.net.'
            },
            {
              title: 'Мога ли да публикувам събитие самостоятелно?',
              text: 'Днес само ние можем да въвеждаме събития за партньори за сътрудничество. Моля, свържете се с нас на vima@ileu.net, за да ни предоставите повече информация относно партньорствата за сътрудничество. Ще се радваме да получим предложения за важни събития в град Улм и околностите.'
            }
          ]
        },
        {
          title: 'Партньори за сътрудничество',
          content: [
            {
              title: 'В момента този раздел все още е в процес на изграждане',
              text: ''
            }
          ]
        },
        {
          title: 'Бюлетин',
          content: [
            {
              title: 'Как мога да се абонирам за бюлетина?',
              text: 'Кликнете върху Абониране за бюлетин в долната част на уебсайта. Като регистриран потребител можете да управлявате абонамента си за бюлетина в <b>Отвори моята ViMA -> Моите настройки</b>.'
            },
            {
              title: 'Кой отговаря за платформата ViMA?',
              text: "ViMA (Virtuell. Mitmachen. Aktiv! в град Улм) се управлява от ILEU e.V. (Институт за виртуално и реално обучение в образованието за възрастни към Университета на град Улм) и е финансиран като част от проекта 'Ulm4CleverCity - Smart City Model City' от Службата „За цифров дневен ред“ на град Улм"
            }
          ]
        },
        {
          title: 'Докладване на Потребители/Публикации',
          content: [
            {
              title: 'Какво се случва, когато блокирам потребител?',
              text: 'Можете да блокирате и деблокирате потребители в чата (<b>Отвори моята ViMA -> Моите чатове</b>). Блокираните потребители вече не могат да използват чата, за да ви изпращат съобщения. Тук може също да видите кога друг потребител ви е блокирал. Ако искате да докладвате потребител, използвайте функцията за докладване (три точки) под съобщението за публикация/чат на този потребител.'
            },
            {
              title: 'Как мога да докладвам потребител на хората, отговорни за ViMA?',
              text: 'Може да докладвате за потребителски публикации, като използвате трите точки под тази публикация. Моля, посочете причината за вашия сигнал в полето, което се показва, когато кликнете върху <b>Докладване</b>. Вашето съобщение ще бъде препратено до нашите администратори, които ще отговорят възможно най-бързо. Сигналите за нарушения в рамките на групи по интереси ще бъдат изпращани до инициаторите и модераторите на тази група по интереси.'
            },
            {
              title: 'Как мога да докладвам за публикация?',
              text: 'Може да подадете сигнал за публикации, които нарушават нашите насоки за комуникация, като използвате бутона с трите точки, който се показва под всяка публикация. Когато кликнете върху <b>Докладване</b>,се появява поле за  <b>текст</b>. Моля, дайте кратко обяснение защо докладвате публикацията. Сигналът се изпраща директно до нашите администратори, които ще отговорят възможно най-бързо. Сигналите за нарушения в рамките на групи по интереси ще бъдат изпращани до инициаторите и модераторите на тази група по интереси.'
            }
          ]
        },
        {
          title: 'Други',
          content: [
            {
              title: 'Общи',
              text: 'Ако срещнете проблеми със зареждането на уебсайта или виждането на нови публикации, препоръчваме да презаредите уебсайта няколко пъти (Refresh или комбинация от клавиши <Ctrl> + <R>).'
            }
          ]
        }
      ]

    }
  }),

  async mounted () {
  },

  methods: {
  },

  computed: {
    computedFaq () {
      if (this.faq[this.$i18n.locale]) {
        return this.faq[this.$i18n.locale]
      } else {
        return this.faq[this.$i18n.fallbackLocale]
      }
    }
  }
}
</script>
