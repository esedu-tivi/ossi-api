const users = (parent, args, context, info) => {
    return []
}

const testAuthentication = (parent, args, context, info) => {
    if (context.user) {
        return true
    }

    return false
}

export const Query = {
    users,
    testAuthentication
}