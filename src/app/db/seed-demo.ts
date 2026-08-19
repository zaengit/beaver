import { seedTemplate } from "./seed-template"

seedTemplate("flowstack").catch((error) => {
  console.error(error)
  process.exitCode = 1
})
