<template>
  <v-card
    color="customGreyBg"
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
        v-for="(el, i) in faq"
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
    faq: [
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
            text: 'ViMA (Virtuell.Mitmachen.Aktiv! in Ulm) wird von ILEU e.V. (Institut für virtuelles und reales Lernen in der Erwachsenenbildung an der Universität Ulm e.V.) betrieben und gefördert im Rahmen des Projekts „Ulm4CleverCity – Smart City Modellstadt“ durch die Geschäftsstelle Digitale Agenda der Stadt Ulm.'
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
    ]
  }),

  async mounted () {
  },

  methods: {
  },

  computed: {
  }
}
</script>
