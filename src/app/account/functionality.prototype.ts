import { PlatformInterceptorBuilder } from "@uniscale-sdk/ActorCharacter-Messagethreads"
import { Patterns } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account"
import { UserFull } from "@uniscale-sdk/ActorCharacter-Messagethreads/sdk/UniscaleDemo/Account/Account"

const userMap = new Map<string,UserFull>()

export const registerAccountInterceptors = (builder: PlatformInterceptorBuilder) => {
    // In here we define all our prototyping mocks to simulate implemented functionality that we want
    // to use while we build our frontend through high speed iterations.
    //
    // In this case have have defined a static map of users that we utilize
    // when implementing the features. As a result the application will reset
    // every time you reload. If you wanted a more complex scenario you could
    // use the browsers local storage so that your prototype data can be
    // persisted between reloads
    builder
        .interceptRequest(
            // We can use the generated pattern structures in the generated SDK to
            // find the functionality we want to intercept. By using the
            // allRequestUsages we will intercept a call to any of the use case flows
            // that contains this feature
            Patterns.account.getOrRegister.allRequestUsages,
            // From the generated pattern pattern structure we can also find helper
            // methods that we can use to implement the feature handler
            Patterns.account.getOrRegister.handleDirect((input, ctx) => {
                const existingUser = Array.from(userMap.values())
                    .find(u => u.handle === input)
                if (existingUser)
                    return existingUser
                const user: UserFull = {
                    userIdentifier: 'ccd004b0-57a2-11ee-8c99-0242ac120002',
                    handle: input
                }
                userMap.set(user.userIdentifier as string, user)
                return user
            })
        )
        .interceptRequest(
            Patterns.account.searchAllUsers.allRequestUsages,
            Patterns.account.searchAllUsers.handleDirect((input, ctx) => {
                if (input === '')
                    return Array.from(userMap.values())
                return Array.from(userMap.values())
                    .filter(u => (u.handle as string).indexOf(input, 0) > 0)
            })
        )
        .interceptRequest(
            Patterns.account.lookupUsers.allRequestUsages,
            Patterns.account.lookupUsers.handleDirect((input, ctx) => {
                const list = new Map<string,UserFull>()
                input.forEach(id => {
                    if (list.has(id))
                        return
                    list.set(id, userMap.get(id) as UserFull)
                })
                return Array.from(list.values())
            })
        )
}