import { Contact } from "lucide-react"

// Set to true when projects are ready; restores the showcase and its navigation.
export const showSelectedWork = false

// Replace these details with your own before publishing.
export const profile = {
  name: 'Muza',
  fullName: 'Mukhlis Zahrawani Sutrisno',
  location: 'Surabaya, Indonesia',
  email: 'mukhliszahrawanisutrisno@gmail.com', // Your real email enables the contact form.
  availability: 'Open to collaboration',
  focus: 'Frontend development & UI/UX design',
  stack: ['React', 'TypeScript', 'Vite', 'Motion', 'CSS'],
  // GitHub repository from this project's existing origin remote.
  github: 'https://github.com/MukhlisZahrawaniSutrisno',
  linkedin: 'https://www.linkedin.com/in/mukhlis-zahrawani-s-149b8843b',
  whatsapp: '62895321686171', 
}

// Keep these grounded in the technologies already present in this project.
export const skillGroups = [
  { name: 'Languages', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
  { name: 'Frameworks & Libraries', items: ['React', 'Motion', 'Lucide'] },
  { name: 'Databases', items: ['MySQL'] },
  { name: 'Tools', items: ['Vite', 'Git', 'GitHub', 'VS Code', 'Figma'] },
] as const
