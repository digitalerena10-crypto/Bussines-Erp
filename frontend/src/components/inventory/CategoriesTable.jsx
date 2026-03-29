import { ListTree, Layers } from 'lucide-react';
import ActionButtons from '../common/ActionButtons';

const CategoriesTable = ({ categories, onEdit, onDelete }) => {
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 md:h-64 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                    <ListTree size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
                <p className="text-gray-500 text-sm text-center">Create your first category to see it here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[500px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                    <tr>
                        <th className="px-4 md:px-6 py-4">Category Name</th>
                        <th className="px-4 md:px-6 py-4 hidden md:table-cell">Parent Hierarchy</th>
                        <th className="px-4 md:px-6 py-4">Description</th>
                        <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {categories.map(category => {
                        const parentName = category.parent_id ? categories.find(c => c.id === category.parent_id)?.name || category.parent_id : null;

                        return (
                            <tr key={category.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-4 md:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{category.name}</div>
                                            {parentName && <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 md:hidden">SUB: {parentName}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                                    {parentName ? (
                                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                            {parentName}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                            Root Category
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <p className="text-xs md:text-sm font-medium text-gray-600 line-clamp-2 max-w-xs">{category.description || '-'}</p>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-right">
                                    <ActionButtons onEdit={() => onEdit(category)} onDelete={() => onDelete(category.id)} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CategoriesTable;
