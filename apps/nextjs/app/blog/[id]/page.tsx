import BlogFilters from "@/components/BlogFilters";

type Props = {
    params: {
        id: string;
    };
    searchParams?: {
        sort?: string;
        page?: string;
    };
};

export default async function BlogPostPage({ params, searchParams }: Props) {
    const { id } = await params;
    const { sort, page } = await searchParams || {};

    // console.log('XXX BlogPostPage params', params);
    console.log('XXX BlogPostPage id', id);
    console.log('XXX BlogPostPage sort', sort);
    console.log('XXX BlogPostPage page', page);

    // v reále by si fetchoval dáta z DB alebo API:
    const posts = {
        "1": "Obsah prvého článku",
        "2": "Obsah druhého článku",
        abc: "Obsah článku s textovým ID",
    };

    const content = posts[id] ?? "Článok neexistuje.";

    return (
        <div>
            <h1>Blog post {id}</h1>
            <p>{content}</p>

            <BlogFilters />
        </div>
    );
}