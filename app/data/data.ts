import { FullArticleContent } from "../(main)/ArticleContentModal";
// Assuming you have a dummy image to import
import img from '@/assets/images/new.png'; 
import newImg from '@/assets/images/new.png';
import calenderr from '@/assets/images/calenderr.png';

export const dummyArticles = [
  {
    id: 0,
    title: "A message from Luna: Your guide to our app",
    readTime: "3 min read",
    image: img,
    postedBy: "Luna",
    postedWhen: "Today",
    isLunaArticle: true,
  },
  {
    id: 1,
    title: "Understanding your period: What's normal?",
    readTime: "5 min read",
    image: img,
    postedBy: "Jane Doe",
    postedWhen: "1 month ago",
  },
  {
    id: 2,
    title: "Coping with cramps: Tips & tricks",
    readTime: "7 min read",
    image: newImg,
    postedBy: "Sarah Lee",
    postedWhen: "2 weeks ago",
  },
  {
    id: 3,
    title: "Signs of hormonal imbalance to watch out for",
    readTime: "9 min read",
    image: img,
    postedBy: "Emily White",
    postedWhen: "1 month ago",
  },
  {
    id: 4,
    title: "How diet affects your menstrual cycle",
    readTime: "6 min read",
    image: calenderr,
    postedBy: "Jessica Chan",
    postedWhen: "Today",
  },
  {
    id: 5,
    title: "The link between stress and your period",
    readTime: "8 min read",
    image: newImg,
    postedBy: "Olivia Rodriguez",
    postedWhen: "2 days ago",
  },
];

export const fullArticleContentData: Record<number, FullArticleContent> = {
  // ... (Your existing fullArticleContentData object with full content)
  0: {
    id: 0,
    title: "A message from Luna: Your guide to our app",
    content: `Welcome to Luna, your personal guide...`,
    activities: ["Log your symptoms daily", "Explore the calendar and patterns", "Engage with the community forum"],
  },
  1: {
    id: 1,
    title: "Understanding your period: What's normal?",
    content: `A "normal" period can vary greatly...`,
    activities: ["Check your cycle history", "Learn about hormonal changes", "Talk to a healthcare provider"],
  },
  2: {
    id: 2,
    title: "Coping with cramps: Tips & tricks",
    content: `Period cramps, medically known as dysmenorrhea...`,
    activities: ["Practice light stretching or yoga", "Try a heating pad", "Drink herbal tea"],
  },
  3: {
    id: 3,
    title: "Signs of hormonal imbalance to watch out for",
    content: `Hormones are chemical messengers...`,
    activities: ["Track your mood & energy levels", "Review your sleep patterns", "Consult a professional"],
  },
  4: {
    id: 4,
    title: "How diet affects your menstrual cycle",
    content: `What you eat has a profound impact...`,
    activities: ["Plan your meals", "Try a new healthy recipe", "Keep a food diary"],
  },
  5: {
    id: 5,
    title: "The link between stress and your period",
    content: `Stress can have a powerful impact...`,
    activities: ["Try meditation", "Go for a short walk", "Start a daily gratitude journal"],
  },
};