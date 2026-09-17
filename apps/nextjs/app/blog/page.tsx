import Link from "next/link";

const posts = [
    { id: "1", title: "Prvý článok" },
    { id: "2", title: "Druhý článok" },
    { id: "abc", title: "Článok s textovým ID" },
];

export default function BlogPage() {
    return (
        <div>
            <h1>Blog2</h1>
            <ul>
                {posts.map((post) => (
                    <li key={post.id}>
                        <Link href={`/blog/${post.id}?sort=desc&page=2`}>{post.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}