import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput"

export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes('@')) {
        return   [{
                field: 'email',
                message: 'email must include @'
            }]
        }
    
    
    if (options.username.length <= 2) {
        return 
            [{
                field: 'username',
                message: 'username length must be grater than 2'
            }]
        
    }

    if (options.password.length <= 2) {
        return [{
                field: 'password',
                message: 'password length must bt at least 2'
            }]
        }
    
    return null
}