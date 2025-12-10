import { z } from "zod";
export const SignupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Minimum 2 characters are required" })
    .max(20, { message: "Maximum of 20 characters are allowed" }),
  email: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 6 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" }),
});

export const LoginSchema = z.object({
  email: z
    .email({ message: "Invalid email" })
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" }),
});

// const router = useRouter();
// const {
//   error,
//   success,
//   loading,
//   setSuccess,
//   setError,
//   setLoading,
//   resetState,
// } = useAuthState();

// const form = useForm<z.infer<typeof LoginSchema>>({
//   resolver: zodResolver(LoginSchema),
//   defaultValues: {
//     email: "",
//     password: "",
//   },
// });

// const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
//     try {
//       await signIn.email({
//         email: values.email,
//         password: values.password
//       }, {
//         onResponse: () => {
//           setLoading(false)
//         },
//         onRequest: () => {
//           resetState()
//           setLoading(true)
//         },
//         onSuccess: (ctx) => {
//             setSuccess("LoggedIn successfully")
//             router.replace('/')
//         },
//         onError: (ctx) => {
//           setError(ctx.error.message);
//         },
//       });
//     } catch (error) {
//       console.log(error)
//       setError("Something went wrong")
//     }
//   }
