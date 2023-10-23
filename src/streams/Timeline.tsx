import { DispatcherSession } from "@uniscale-sdk/ActorCharacter-Messagethreads"
import { Empty, MessageFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages/Messages"
import { GetMessageList } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages_1_0/Functionality/ServiceToModule/Messages/Timeline/ListMessages"
import { SendMessage } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Messages_1_0/Functionality/ServiceToModule/Messages/Timeline/SendMessage"
import { UserFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account/Account"
import { LookupUsers } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account_1_0/Functionality/ServiceToModule/Account/GetUsers/QuickLookup"
import { useState } from "react"

interface TimelineProps {
    dispatcher: DispatcherSession
    user: UserFull
}

interface MessageProps {
    message: MessageFull,
    user: UserFull
}

const Message = (props: MessageProps) => {
    return (
        <div>
            <p>
                {props.user.handle}<br/>
                {props.message.message}
            </p>
            <div>-----------------------</div>
        </div>
    )
}

interface MessageResults {
    messages: MessageFull[],
    users: UserFull[]
}

export const Timeline = (props: TimelineProps) => {
    const [inialized, setInitialized] = useState(false)
    const [messages, setMessages] = useState<MessageResults>({ messages: [], users: []})
    const [messageInput, setMessageInput] = useState<string>('')

    const getMessages = async () => {
        // By using the "with" function on the defined feature in the SDK we can
        // pass it through the dispatcher and get our result.
        var result = await props.dispatcher.request(GetMessageList.with(new Empty()))
        if (!result.success) {
            console.log(result.error?.toLongString())
            return
        }
        // By using the "with" function on the defined feature in the SDK we can
        // pass it through the dispatcher and get our result.
        var usersResult = await props.dispatcher.request(LookupUsers.with(
            (result.value as MessageFull[]).map(u => u.created?.by as string)
        ))
        if (!usersResult.success) {
            console.log(usersResult.error?.toLongString())
            return
        }
        setMessages({
            messages: result.value as MessageFull[],
            users: usersResult.value as UserFull[]
        })
    }

    const sendMessage = async (msg: string) => {
        // By using the "with" function on the defined feature in the SDK we can
        // pass it through the dispatcher and get our result.
        var result = await props.dispatcher.request(SendMessage.with({
            by: props.user.userIdentifier,
            message: msg
        }))
        if (!result.success)
            console.log(result.error?.toLongString())
        setMessageInput('')
        getMessages()
    }

    if (!inialized) {
        getMessages()
        setInitialized(true)
    }

    const messageComponents = messages.messages
        .map(m => (<Message
                    key={m.messageIdentifier}
                    message={m}
                    user={messages.users.find(u => u.userIdentifier === m.created?.by) as UserFull}
                    />))

    return (
        <div>
            <div>
                {messageComponents}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter a message here..."
                    value={messageInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setMessageInput(e.target.value)
                    }}
                />
                <button onClick={() => sendMessage(messageInput)}>Continue</button>
            </div>
        </div>
    )
}