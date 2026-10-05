# Notifikaatio- ja viestintäjärjestelmän kaaviot

## 1. Notifikaatiojärjestelmä

### 1.1 Datavirta

```mermaid
flowchart LR
    FE["Frontend\n(React / Apollo)"]
    GW["API Gateway\n(GraphQL / Express)"]
    SMA["student-management-api\n(REST / Prisma)"]
    NS["notification-server\n(REST / Express)"]
    REDIS[("Redis\nkanava: notification")]
    MONGO[("MongoDB\nkokoelma: notifications")]

    FE -- "mutation updateStudentProject\n(status: RETURNED)" --> GW
    FE -- "mutation changeProjectStatus\n(ACCEPTED / REJECTED)" --> GW
    FE -- "mutation updateProject\n(notifyStudents: true)" --> GW

    GW -- HTTP PUT/PATCH --> SMA
    SMA -- "publish('notification', payload)" --> REDIS
    REDIS -- "subscribe('notification')" --> NS
    NS -- "save(Notification)" --> MONGO

    FE -- "query notifications" --> GW
    FE -- "query unreadNotificationCount" --> GW
    GW -- "HTTP GET /notifications/" --> NS
    NS -- "find({ recipient })" --> MONGO
    MONGO -- "[Notification]" --> NS
    NS -- "JSON { notifications }" --> GW
    GW -- "GraphQL Notification[]" --> FE

    FE -- "mutation markNotificationAsRead(id)" --> GW
    GW -- "HTTP POST /notifications/:id/mark_as_read" --> NS
    NS -- "findOneAndUpdate({ hasBeenRead: true })" --> MONGO
```

### 1.2 Sekvenssikaavio — opiskelija palauttaa projektin

```mermaid
sequenceDiagram
    actor Opiskelija
    participant FE as Frontend
    participant GW as API Gateway
    participant SMA as student-management-api
    participant Redis
    participant NS as notification-server
    participant Mongo as MongoDB

    Opiskelija->>FE: Palauta projekti
    FE->>GW: mutation updateStudentProject(status: RETURNED)
    GW->>SMA: PUT /students/:id/projects/:id
    SMA->>SMA: Hae vastaavat opettajat (teacherIds)
    SMA->>Redis: publish("notification", { recipients: teacherIds, type: "ProjectReturn", projectId, returnerStudentId })
    SMA-->>GW: { success: true }
    GW-->>FE: GenericResponse

    Redis-->>NS: subscribe("notification") käynnistyy
    NS->>Mongo: save(ProjectReturnNotification × n kpl)
    Note over NS,Mongo: ⚠️ Tällä hetkellä forEach(async) ei odota Promise.all

    Note over FE,GW: Myöhemmin — opettajan seuraava sivulatauss

    actor Opettaja
    Opettaja->>FE: Avaa sovellus
    FE->>GW: query unreadNotificationCount
    GW->>NS: GET /notifications/unread_notification_count
    NS->>Mongo: countDocuments({ recipient, hasBeenRead: false })
    Mongo-->>NS: count
    NS-->>GW: { count }
    GW-->>FE: UnreadNotificationCountResponse
    FE->>FE: Näytä puna-badge headerissa

    Opettaja->>FE: Avaa ilmoituspaneeli
    FE->>GW: query notifications
    GW->>NS: GET /notifications/
    NS->>Mongo: find({ recipient })
    Mongo-->>NS: [Notification]
    NS-->>GW: { notifications }
    GW-->>FE: Notification[]
    FE->>FE: Renderöi NotificationPanel

    Opettaja->>FE: Klikkaa ilmoitusta
    FE->>GW: mutation markNotificationAsRead(id)
    GW->>NS: POST /notifications/:id/mark_as_read
    NS->>Mongo: findOneAndUpdate({ hasBeenRead: true })
    Mongo-->>NS: ok
    NS-->>GW: { success: true }
    GW-->>FE: MarkNotificationAsReadResponse
    FE->>FE: Päivitä UI (refetch)
```

### 1.3 Sekvenssikaavio — opettaja muuttaa projektin statuksen

```mermaid
sequenceDiagram
    actor Opettaja
    participant FE as Frontend
    participant GW as API Gateway
    participant SMA as student-management-api
    participant Redis
    participant NS as notification-server
    participant Mongo as MongoDB

    Opettaja->>FE: Hyväksy / Hylkää projekti
    FE->>GW: mutation changeProjectStatus(id, status, studentId, teacherComment)
    GW->>SMA: POST /projects/:id/change-status
    SMA->>Redis: publish("notification", { recipients: [studentId], type: "ProjectStatusChange", status, message, teacherComment })
    SMA-->>GW: { success: true }
    GW-->>FE: ChangeProjectStatusResponse

    Redis-->>NS: subscribe("notification") käynnistyy
    NS->>Mongo: save(ProjectStatusChangeNotification)
```

---

## 2. Viestintäjärjestelmä

### 2.1 Datavirta

```mermaid
flowchart LR
    FE["Frontend\n(React / Apollo)\n⚠️ Ei vielä toteutettu"]
    GW["API Gateway\n(GraphQL)"]
    MSG["messaging-server\n(GraphQL / Express)"]
    REDIS[("Redis\nkanavat:\nnew_message\nmessage_received\nget_conversations\nconversations_response\nget_messages\nmessages_response\ncreate_conversation\nconversation_created")]
    MONGO[("MongoDB\nkokoelmat:\nmessages\nconversations")]
    PRISMA[("PostgreSQL\n(Prisma ORM)\nkautta messaging-server")]

    FE -- "query conversations" --> GW
    FE -- "query messages(conversationId)" --> GW
    FE -- "mutation createConversation" --> GW
    FE -- "mutation sendMessage" --> GW
    FE -- "query searchUsers" --> GW

    GW -- "HTTP POST /graphql\n(searchUsers)" --> MSG
    MSG -- "prisma.user.findMany" --> PRISMA

    GW -- "publish(get_conversations)" --> REDIS
    GW -- "publish(get_messages)" --> REDIS
    GW -- "publish(create_conversation)" --> REDIS
    GW -- "publish(new_message)" --> REDIS

    REDIS -- "subscribe(get_conversations)" --> MSG
    REDIS -- "subscribe(get_messages)" --> MSG
    REDIS -- "subscribe(create_conversation)" --> MSG
    REDIS -- "subscribe(new_message)" --> MSG

    MSG -- "Conversation.find / Message.find / .create" --> MONGO
    MONGO -- "tulokset" --> MSG

    MSG -- "publish(conversations_response)" --> REDIS
    MSG -- "publish(messages_response)" --> REDIS
    MSG -- "publish(conversation_created)" --> REDIS
    MSG -- "publish(message_received)" --> REDIS

    REDIS -- "subscribe(conversations_response)" --> GW
    REDIS -- "subscribe(messages_response)" --> GW
    REDIS -- "subscribe(conversation_created)" --> GW
    REDIS -- "subscribe(message_received)" --> GW
```

### 2.2 Sekvenssikaavio — uuden keskustelun aloitus

```mermaid
sequenceDiagram
    actor Käyttäjä
    participant FE as Frontend
    participant GW as API Gateway
    participant Redis
    participant MSG as messaging-server
    participant Mongo as MongoDB

    Käyttäjä->>FE: Hae käyttäjiä
    FE->>GW: query searchUsers(query: "Matti")
    GW->>MSG: HTTP POST /graphql { searchUsers }
    MSG->>Mongo: prisma.user.findMany(where: { OR: [firstName, lastName, email] })
    Note over MSG,Mongo: Hakee PostgreSQL:stä Prisma ORM:n kautta
    Mongo-->>MSG: [User]
    MSG-->>GW: { data: { searchUsers: [...] }}
    GW-->>FE: User[]

    Käyttäjä->>FE: Valitse vastaanottaja, luo keskustelu
    FE->>GW: mutation createConversation(participantIds: ["user@email.fi"])
    GW->>Redis: publish("create_conversation", { participantIds, userEmail })
    GW->>GW: subscribe("conversation_created") — odottaa max 5s

    Redis-->>MSG: subscribe("create_conversation")
    MSG->>Mongo: Conversation.create({ participants: [...participantIds, userEmail] })
    Mongo-->>MSG: conversation
    MSG->>Redis: publish("conversation_created", mappedConversation)

    Redis-->>GW: subscribe("conversation_created") laukeaa
    GW->>GW: unsubscribe("conversation_created")
    GW-->>FE: Conversation { id, participants, createdAt }
    Note over GW: ⚠️ Race condition: jos kaksi käyttäjää luo keskustelua<br/>samanaikaisesti, he voivat saada toistensa vastauksen
```

### 2.3 Sekvenssikaavio — viestin lähetys

```mermaid
sequenceDiagram
    actor Lähettäjä
    participant FE as Frontend
    participant GW as API Gateway
    participant Redis
    participant MSG as messaging-server
    participant Mongo as MongoDB

    Lähettäjä->>FE: Kirjoita ja lähetä viesti
    FE->>GW: mutation sendMessage(conversationId, content)
    GW->>Redis: publish("new_message", { conversationId, content, sender: context.user })
    GW->>GW: subscribe("message_received") — odottaa max 5s

    Redis-->>MSG: subscribe("new_message")
    MSG->>Mongo: Message.create({ conversationId, content, sender, readBy: [sender] })
    MSG->>Mongo: Conversation.findByIdAndUpdate({ lastMessage })
    Mongo-->>MSG: ok
    MSG->>Redis: publish("message_received", { id, conversationId, content, sender, readBy, createdAt })

    Redis-->>GW: subscribe("message_received") laukeaa
    Note over GW: Tarkistaa: parsedMessage.conversationId === conversationId
    GW->>GW: unsubscribe("message_received")
    GW-->>FE: Message { id, content, sender, createdAt }

    Note over Redis,MSG: Sama "message_received"-kanava triggeröi myös<br/>GraphQL Subscription -tilaajat (messagingPubSub)
```

### 2.4 Sekvenssikaavio — keskusteluhistorian haku

```mermaid
sequenceDiagram
    actor Käyttäjä
    participant FE as Frontend
    participant GW as API Gateway
    participant Redis
    participant MSG as messaging-server
    participant Mongo as MongoDB

    Käyttäjä->>FE: Avaa keskustelu
    FE->>GW: query conversations
    Note over FE,GW: query.ts:conversations käyttää suoraa HTTP:tä,<br/>ei Redis pub/sub -mallia

    GW->>MSG: HTTP POST /graphql { conversations }
    MSG->>MSG: context.user.email (Authorization-headerista)
    MSG->>Mongo: Conversation.find({ participants: userEmail }).populate("lastMessage")
    Mongo-->>MSG: [Conversation]
    MSG->>Mongo: getUserFromDatabase(email) × n (jokaiselle osallistujalle)
    Mongo-->>MSG: [User]
    MSG-->>GW: { data: { conversations: [...] } }
    GW-->>FE: Conversation[]

    Käyttäjä->>FE: Valitse keskustelu
    FE->>GW: query messages(conversationId)
    GW->>Redis: publish("get_messages", { conversationId, userEmail })
    GW->>GW: subscribe("messages_response") — odottaa max 5s

    Redis-->>MSG: subscribe("get_messages")
    MSG->>Mongo: Conversation.findById (tarkista osallistujuus)
    MSG->>Mongo: Message.find({ conversationId }).sort({ createdAt: 1 })
    Mongo-->>MSG: [Message]
    MSG->>Redis: publish("messages_response", mappedMessages)

    Redis-->>GW: subscribe("messages_response") laukeaa
    GW->>GW: unsubscribe("messages_response")
    GW-->>FE: Message[]
```

---

## 3. Yhteenveto — tunnistetut ongelmat

| # | Järjestelmä | Ongelma | Vakavuus |
|---|-------------|---------|----------|
| 1 | Notifikaatiot | `forEach(async)` ei odota tallennuksia — käytä `Promise.all` | Keski |
| 2 | Notifikaatiot | Ei reaaliaikaista push-ilmoitusta, vain polling | Matala |
| 3 | Viestit | Redis pub/sub request-reply on race condition -altis | **Korkea** |
| 4 | Viestit | `markMessageAsRead` resolver puuttuu API Gatewaystä | Keski |
| 5 | Viestit | Frontend chat-UI puuttuu kokonaan | **Korkea** |
| 6 | Viestit | GraphQL Subscriptions ei toimi (ei WS-tukea gatewayssä) | Keski |
| 7 | Viestit | `conversation(id)` query puuttuu API Gateway resolverista | Matala |
