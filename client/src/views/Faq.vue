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
